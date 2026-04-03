import { jsPDF } from "jspdf";
import type { SearchQuery, QueryStatus } from "@/lib/api/queries";
import type {
	OfacMatch,
	UnscMatch,
	Sat69bMatch,
} from "@/lib/api/watchlist-search";
import type { Language, translations } from "@/lib/translations";
import type { WatchlistFeatures } from "@/lib/api/watchlist-config";

const DEFAULT_PDF_FEATURES: WatchlistFeatures = {
	pepSearch: true,
	pepGrok: true,
	adverseMedia: true,
};

type TranslationFn = (key: keyof (typeof translations)["es"]) => string;

interface GrokPepResult {
	probability: number;
	summary: string | { es: string; en: string };
	sources?: string[];
}

interface AdverseMediaResult {
	risk_level: "none" | "low" | "medium" | "high";
	findings?: string | { es: string; en: string };
	sources?: string[];
}

interface PepRawResult {
	id: string;
	nombre: string;
	informacionPrincipal?: {
		institucion?: string;
		cargo?: string;
		area?: string;
	};
}

interface OrgInfo {
	name: string;
	logo?: string | null;
}

const COLORS = {
	primary: [30, 41, 56] as [number, number, number],
	accent: [122, 34, 206] as [number, number, number],
	green: [22, 163, 74] as [number, number, number],
	red: [220, 38, 38] as [number, number, number],
	yellow: [202, 138, 4] as [number, number, number],
	gray: [107, 114, 128] as [number, number, number],
	lightGray: [243, 244, 246] as [number, number, number],
	white: [255, 255, 255] as [number, number, number],
	border: [229, 231, 235] as [number, number, number],
};

const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function looksLikeUrl(value: string): boolean {
	return (
		/^https?:\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+(\/.*)?\s*$/.test(value)
	);
}

function ensureProtocol(value: string): string {
	return /^https?:\/\//i.test(value) ? value : `https://${value.trim()}`;
}

function extractHostname(value: string): string {
	try {
		return new URL(ensureProtocol(value)).hostname;
	} catch {
		return value;
	}
}

const FAVICON_PDF_MM = 3;
const FAVICON_PDF_GAP_MM = 1.5;

/**
 * Same-origin proxy avoids CORS/tainted-canvas issues when decoding third-party favicons.
 * Output is always PNG for jsPDF.addImage(..., "PNG").
 */
async function fetchFaviconDataUrl(hostname: string): Promise<string | null> {
	if (typeof document === "undefined") return null;

	const path = `/api/favicon?host=${encodeURIComponent(hostname)}`;

	try {
		const res = await fetch(path, { signal: AbortSignal.timeout(4000) });
		if (!res.ok) return null;
		const blob = await res.blob();

		if (typeof createImageBitmap === "function") {
			try {
				const bitmap = await createImageBitmap(blob);
				const canvas = document.createElement("canvas");
				canvas.width = bitmap.width || 32;
				canvas.height = bitmap.height || 32;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					bitmap.close();
					return null;
				}
				ctx.drawImage(bitmap, 0, 0);
				bitmap.close();
				return canvas.toDataURL("image/png");
			} catch {
				// fall through to blob-URL + Image
			}
		}

		return new Promise((resolve) => {
			const objectUrl = URL.createObjectURL(blob);
			const img = new Image();
			const timeout = setTimeout(() => {
				URL.revokeObjectURL(objectUrl);
				img.src = "";
				resolve(null);
			}, 3000);

			img.onload = () => {
				clearTimeout(timeout);
				try {
					const canvas = document.createElement("canvas");
					canvas.width = img.naturalWidth || 32;
					canvas.height = img.naturalHeight || 32;
					const ctx = canvas.getContext("2d");
					if (!ctx) {
						URL.revokeObjectURL(objectUrl);
						resolve(null);
						return;
					}
					ctx.drawImage(img, 0, 0);
					URL.revokeObjectURL(objectUrl);
					resolve(canvas.toDataURL("image/png"));
				} catch {
					URL.revokeObjectURL(objectUrl);
					resolve(null);
				}
			};

			img.onerror = () => {
				clearTimeout(timeout);
				URL.revokeObjectURL(objectUrl);
				resolve(null);
			};

			img.src = objectUrl;
		});
	} catch {
		return null;
	}
}

async function prefetchSourceFavicons(
	hostnames: string[],
): Promise<Map<string, string>> {
	const map = new Map<string, string>();
	await Promise.all(
		hostnames.map(async (host) => {
			const dataUrl = await fetchFaviconDataUrl(host);
			if (dataUrl) map.set(host, dataUrl);
		}),
	);
	return map;
}

function getPdfSourceHostnames(
	data: SearchQuery,
	features: WatchlistFeatures,
): string[] {
	const set = new Set<string>();
	if (
		data.entityType !== "organization" &&
		features.pepGrok &&
		data.pepAiStatus !== "skipped"
	) {
		const pepAiRaw = data.pepAiResult as GrokPepResult | null;
		if (pepAiRaw?.sources?.length) {
			for (const src of pepAiRaw.sources) {
				if (looksLikeUrl(src)) set.add(extractHostname(src));
			}
		}
	}
	if (features.adverseMedia) {
		const adverseRaw = data.adverseMediaResult as AdverseMediaResult | null;
		if (adverseRaw?.sources?.length) {
			for (const src of adverseRaw.sources) {
				if (looksLikeUrl(src)) set.add(extractHostname(src));
			}
		}
	}
	return [...set];
}

function getBilingualText(
	value: string | { es: string; en: string } | undefined,
	language: Language,
): string {
	if (!value) return "";
	if (typeof value === "string") return value;
	return value[language] || value.es || "";
}

function getStatusLabel(
	status: QueryStatus | null | undefined,
	t: TranslationFn,
): string {
	if (!status) return t("pdfDisabled");
	const map: Record<string, string> = {
		completed: t("pdfClean"),
		failed: t("pdfError"),
		pending: "Pending",
		running: "Running",
	};
	return map[status] ?? status;
}

function getAdverseMediaRiskLevelLabel(
	level: AdverseMediaResult["risk_level"],
	t: TranslationFn,
): string {
	switch (level) {
		case "none":
			return t("riskLevelNone");
		case "low":
			return t("riskLevelLow");
		case "medium":
			return t("riskLevelMedium");
		case "high":
			return t("riskLevelHigh");
		default:
			return level;
	}
}

function getMatchName(
	target: OfacMatch["target"] | UnscMatch["target"] | Sat69bMatch["target"],
): string {
	if ("taxpayerName" in target) return target.taxpayerName;
	return target.primaryName;
}

function getDatasetLabel(
	target: OfacMatch["target"] | UnscMatch["target"] | Sat69bMatch["target"],
): string {
	if ("sourceList" in target) return "OFAC";
	if ("unListType" in target) return "UNSC";
	if ("rfc" in target) return "SAT 69-B";
	return "Unknown";
}

function getRiskLabel(score: number): string {
	if (score > 0.75) return "High";
	if (score > 0.5) return "Medium";
	return "Low";
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
	if (y + needed > doc.internal.pageSize.getHeight() - 20) {
		doc.addPage();
		return 25;
	}
	return y;
}

async function loadImageAsBase64(url: string): Promise<string | null> {
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const blob = await res.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

function drawJanovixLogo(doc: jsPDF, x: number, y: number, scale: number) {
	doc.setFillColor(...COLORS.primary);

	// "J" letter approximation
	doc.setFontSize(10 * scale);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(...COLORS.primary);
	doc.text("Janovix", x, y + 3 * scale);

	// Accent mark
	doc.setFillColor(...COLORS.accent);
	doc.rect(x + 28 * scale, y - 1 * scale, 2 * scale, 2 * scale, "F");
}

function drawSectionHeader(
	doc: jsPDF,
	y: number,
	title: string,
	statusText: string,
	statusColor: [number, number, number],
): number {
	y = ensureSpace(doc, y, 20);

	doc.setFillColor(...COLORS.lightGray);
	doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 10, 1.5, 1.5, "F");

	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.setTextColor(...COLORS.primary);
	doc.text(title, MARGIN + 4, y + 6.5);

	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.setTextColor(...statusColor);
	doc.text(statusText, MARGIN + CONTENT_WIDTH - 4, y + 6.5, {
		align: "right",
	});

	return y + 14;
}

type WatchlistMatch = OfacMatch | UnscMatch | Sat69bMatch;

function drawMatchTable(
	doc: jsPDF,
	y: number,
	matches: WatchlistMatch[],
	t: TranslationFn,
): number {
	if (matches.length === 0) return y;

	y = ensureSpace(doc, y, 20);

	// Table header
	doc.setFillColor(...COLORS.border);
	doc.rect(MARGIN, y, CONTENT_WIDTH, 7, "F");
	doc.setFont("helvetica", "bold");
	doc.setFontSize(7);
	doc.setTextColor(...COLORS.primary);
	doc.text(t("pdfName"), MARGIN + 3, y + 4.5);
	doc.text(t("pdfDataset"), MARGIN + 80, y + 4.5);
	doc.text(t("pdfScore"), MARGIN + 110, y + 4.5);
	doc.text(t("pdfRisk"), MARGIN + 135, y + 4.5);
	y += 8;

	doc.setFont("helvetica", "normal");
	doc.setFontSize(7);

	for (const match of matches.slice(0, 20)) {
		y = ensureSpace(doc, y, 7);

		const name = getMatchName(match.target);
		const dataset = getDatasetLabel(match.target);
		const scoreText = `${Math.round(match.score * 100)}%`;
		const risk = getRiskLabel(match.score);

		doc.setTextColor(...COLORS.primary);
		doc.text(name.substring(0, 45), MARGIN + 3, y + 4);
		doc.text(dataset, MARGIN + 80, y + 4);
		doc.text(scoreText, MARGIN + 110, y + 4);

		const riskColor =
			risk === "High"
				? COLORS.red
				: risk === "Medium"
					? COLORS.yellow
					: COLORS.green;
		doc.setTextColor(...riskColor);
		doc.text(risk, MARGIN + 135, y + 4);

		doc.setDrawColor(...COLORS.border);
		doc.line(MARGIN, y + 6, MARGIN + CONTENT_WIDTH, y + 6);
		y += 7;
	}

	if (matches.length > 20) {
		doc.setTextColor(...COLORS.gray);
		doc.text(`+${matches.length - 20} more...`, MARGIN + 3, y + 4);
		y += 7;
	}

	return y + 2;
}

function drawSources(
	doc: jsPDF,
	y: number,
	sources: string[],
	t: TranslationFn,
	favicons: Map<string, string>,
): number {
	if (sources.length === 0) return y;

	y = ensureSpace(doc, y, 10);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(7.5);
	doc.setTextColor(...COLORS.primary);
	doc.text(t("sources"), MARGIN + 4, y);
	y += 5;

	doc.setFont("helvetica", "normal");
	doc.setFontSize(7);

	const linkLineHeightMm = 3.8;

	for (const src of sources) {
		const isLink = looksLikeUrl(src);
		if (isLink) {
			const href = ensureProtocol(src);
			const hostname = extractHostname(src);
			const iconData = favicons.get(hostname);
			const indent = iconData ? FAVICON_PDF_MM + FAVICON_PDF_GAP_MM : 0;
			const textWidth = CONTENT_WIDTH - 8 - indent;

			doc.setFont("helvetica", "normal");
			doc.setFontSize(7);
			doc.setTextColor(37, 99, 235);
			// Full URL for visibility and copy/paste (wraps; no truncation)
			const displayText = href;
			const lines = doc.splitTextToSize(displayText, textWidth);
			const blockHeight = lines.length * linkLineHeightMm + 2;
			y = ensureSpace(doc, y, blockHeight);

			if (iconData) {
				try {
					doc.addImage(
						iconData,
						"PNG",
						MARGIN + 4,
						y - FAVICON_PDF_MM + 0.5,
						FAVICON_PDF_MM,
						FAVICON_PDF_MM,
					);
				} catch {
					// Omit icon if decode fails; text keeps reserved indent
				}
			}

			doc.text(lines, MARGIN + 4 + indent, y);
			doc.link(
				MARGIN + 4,
				y - 3.5,
				CONTENT_WIDTH - 8,
				lines.length * linkLineHeightMm,
				{
					url: href,
				},
			);
			y += lines.length * linkLineHeightMm + 1;
		} else {
			doc.setFont("helvetica", "normal");
			doc.setFontSize(7);
			doc.setTextColor(...COLORS.gray);
			const lines = doc.splitTextToSize(src, CONTENT_WIDTH - 8);
			y = ensureSpace(doc, y, lines.length * linkLineHeightMm + 2);
			doc.text(lines, MARGIN + 4, y);
			y += lines.length * linkLineHeightMm + 1;
		}
	}

	return y + 2;
}

export async function generateScreeningPdf(
	data: SearchQuery,
	org: OrgInfo,
	language: Language,
	t: TranslationFn,
	features: WatchlistFeatures = DEFAULT_PDF_FEATURES,
): Promise<void> {
	const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
	let y = MARGIN;

	const faviconMapPromise = prefetchSourceFavicons(
		getPdfSourceHostnames(data, features),
	);

	// --- Header ---
	let logoLoaded = false;
	if (org.logo) {
		const base64 = await loadImageAsBase64(org.logo);
		if (base64) {
			try {
				doc.addImage(base64, "PNG", MARGIN, y, 14, 14);
				logoLoaded = true;
			} catch {
				// Logo couldn't be rendered, skip
			}
		}
	}

	const textX = logoLoaded ? MARGIN + 18 : MARGIN;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(16);
	doc.setTextColor(...COLORS.primary);
	doc.text(org.name, textX, y + 6);

	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.setTextColor(...COLORS.accent);
	doc.text(t("pdfScreeningReport"), textX, y + 12);

	y += 20;

	doc.setDrawColor(...COLORS.primary);
	doc.setLineWidth(0.5);
	doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
	y += 8;

	const faviconMap = await faviconMapPromise;

	// --- Query metadata (subject full-width; other fields two-column, aligned) ---
	const META_LABEL_PT = 9;
	doc.setFont("helvetica", "bold");
	doc.setFontSize(META_LABEL_PT);
	doc.setTextColor(...COLORS.gray);

	const leftLabelKeys = [
		t("pdfEntityType"),
		...(data.birthDate ? [t("pdfBirthDate")] : []),
		...(data.countries && data.countries.length > 0 ? [t("countries")] : []),
	];
	let maxLeftLabelW = 0;
	for (const lbl of leftLabelKeys) {
		maxLeftLabelW = Math.max(maxLeftLabelW, doc.getTextWidth(`${lbl}:`));
	}
	maxLeftLabelW = Math.max(
		maxLeftLabelW,
		doc.getTextWidth(`${t("pdfQueryId")}:`),
		doc.getTextWidth(`${t("pdfSubject")}:`),
	);

	const rightLabelKeys = [t("pdfDate"), t("pdfStatus")];
	let maxRightLabelW = 0;
	for (const lbl of rightLabelKeys) {
		maxRightLabelW = Math.max(maxRightLabelW, doc.getTextWidth(`${lbl}:`));
	}

	const leftValueX = MARGIN + maxLeftLabelW + 4;
	const rightColLabelX = MARGIN + CONTENT_WIDTH * 0.5;
	const rightValueX = rightColLabelX + maxRightLabelW + 4;
	const leftValueMaxW = Math.max(24, rightColLabelX - leftValueX - 4);

	y = ensureSpace(doc, y, 14);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(META_LABEL_PT);
	doc.setTextColor(...COLORS.gray);
	doc.text(`${t("pdfSubject")}:`, MARGIN, y);
	y += 5;

	doc.setFont("helvetica", "bold");
	doc.setFontSize(12);
	doc.setTextColor(...COLORS.primary);
	const subjectLines = doc.splitTextToSize(
		data.query.toUpperCase(),
		CONTENT_WIDTH,
	);
	doc.text(subjectLines, MARGIN, y);
	y += subjectLines.length * 4.8 + 6;

	const metaLeft = [
		[
			t("pdfEntityType"),
			data.entityType === "organization"
				? language === "es"
					? "Empresa"
					: "Organization"
				: language === "es"
					? "Persona"
					: "Person",
		],
		...(data.birthDate
			? [
					[
						t("pdfBirthDate"),
						data.birthDate.includes("T")
							? data.birthDate.slice(0, 10)
							: data.birthDate,
					],
				]
			: []),
		...(data.countries && data.countries.length > 0
			? [[t("countries"), data.countries.join(", ")]]
			: []),
	];
	const metaRight = [
		[t("pdfDate"), new Date(data.createdAt).toLocaleDateString()],
	];

	const metaRows = Math.max(metaLeft.length, metaRight.length);
	doc.setFontSize(META_LABEL_PT);

	for (let i = 0; i < metaRows; i++) {
		const rowStartY = y;
		let rowHeightMm = 5;

		if (metaLeft[i]) {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(META_LABEL_PT);
			doc.setTextColor(...COLORS.gray);
			doc.text(`${metaLeft[i][0]}:`, MARGIN, rowStartY);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(META_LABEL_PT);
			doc.setTextColor(...COLORS.primary);
			const valLines = doc.splitTextToSize(metaLeft[i][1], leftValueMaxW);
			doc.text(valLines, leftValueX, rowStartY);
			rowHeightMm = Math.max(rowHeightMm, valLines.length * 4.2);
		}
		if (metaRight[i]) {
			doc.setFont("helvetica", "bold");
			doc.setFontSize(META_LABEL_PT);
			doc.setTextColor(...COLORS.gray);
			doc.text(`${metaRight[i][0]}:`, rightColLabelX, rowStartY);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(META_LABEL_PT);
			doc.setTextColor(...COLORS.primary);
			const rightValMaxW = MARGIN + CONTENT_WIDTH - rightValueX;
			const rightLines = doc.splitTextToSize(
				metaRight[i][1],
				Math.max(20, rightValMaxW),
			);
			doc.text(rightLines, rightValueX, rowStartY);
			rowHeightMm = Math.max(rowHeightMm, rightLines.length * 4.2);
		}

		y = rowStartY + rowHeightMm + 1;
	}

	// --- ID + Status (same row, aligned with left/right columns) ---
	y = ensureSpace(doc, y, 8);
	const idStatusY = y;

	doc.setFont("helvetica", "bold");
	doc.setFontSize(META_LABEL_PT);
	doc.setTextColor(...COLORS.gray);
	doc.text(`${t("pdfQueryId")}:`, MARGIN, idStatusY);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(META_LABEL_PT);
	doc.setTextColor(...COLORS.primary);
	const idLines = doc.splitTextToSize(data.id, leftValueMaxW);
	doc.text(idLines, leftValueX, idStatusY);

	doc.setFont("helvetica", "bold");
	doc.setFontSize(META_LABEL_PT);
	doc.setTextColor(...COLORS.gray);
	doc.text(`${t("pdfStatus")}:`, rightColLabelX, idStatusY);
	doc.setFont("helvetica", "normal");
	doc.setFontSize(META_LABEL_PT);
	doc.setTextColor(...COLORS.primary);
	const statusVal = data.status.charAt(0).toUpperCase() + data.status.slice(1);
	const rightValMaxW = MARGIN + CONTENT_WIDTH - rightValueX;
	const statusLines = doc.splitTextToSize(
		statusVal,
		Math.max(20, rightValMaxW),
	);
	doc.text(statusLines, rightValueX, idStatusY);

	const idStatusRowH = Math.max(
		idLines.length * 4.2,
		statusLines.length * 4.2,
		5,
	);
	y = idStatusY + idStatusRowH + 6;

	// --- OFAC ---
	const ofacMatches: OfacMatch[] =
		(data.ofacResult as { matches: OfacMatch[] } | null)?.matches ?? [];
	const ofacStatusColor =
		data.ofacStatus === "completed" && ofacMatches.length > 0
			? COLORS.red
			: data.ofacStatus === "completed"
				? COLORS.green
				: data.ofacStatus === "failed"
					? COLORS.yellow
					: COLORS.gray;
	const ofacStatusText =
		data.ofacStatus === "completed" && ofacMatches.length > 0
			? `${ofacMatches.length} ${t("pdfMatchesFound")}`
			: getStatusLabel(data.ofacStatus, t);

	y = drawSectionHeader(doc, y, "OFAC – SDN", ofacStatusText, ofacStatusColor);
	if (ofacMatches.length > 0) {
		y = drawMatchTable(doc, y, ofacMatches, t);
	}

	// --- UNSC ---
	const unscMatches: UnscMatch[] =
		(data.unResult as { matches: UnscMatch[] } | null)?.matches ?? [];
	const unscStatusColor =
		data.unStatus === "completed" && unscMatches.length > 0
			? COLORS.red
			: data.unStatus === "completed"
				? COLORS.green
				: data.unStatus === "failed"
					? COLORS.yellow
					: COLORS.gray;
	const unscStatusText =
		data.unStatus === "completed" && unscMatches.length > 0
			? `${unscMatches.length} ${t("pdfMatchesFound")}`
			: getStatusLabel(data.unStatus, t);

	y = drawSectionHeader(
		doc,
		y,
		"UNSC – Security Council",
		unscStatusText,
		unscStatusColor,
	);
	if (unscMatches.length > 0) {
		y = drawMatchTable(doc, y, unscMatches, t);
	}

	// --- SAT 69-B ---
	const sat69bMatches: Sat69bMatch[] =
		(data.sat69bResult as { matches: Sat69bMatch[] } | null)?.matches ?? [];
	const sat69bStatusColor =
		data.sat69bStatus === "completed" && sat69bMatches.length > 0
			? COLORS.red
			: data.sat69bStatus === "completed"
				? COLORS.green
				: data.sat69bStatus === "failed"
					? COLORS.yellow
					: COLORS.gray;
	const sat69bStatusText =
		data.sat69bStatus === "completed" && sat69bMatches.length > 0
			? `${sat69bMatches.length} ${t("pdfMatchesFound")}`
			: getStatusLabel(data.sat69bStatus, t);

	y = drawSectionHeader(
		doc,
		y,
		"SAT 69-B",
		sat69bStatusText,
		sat69bStatusColor,
	);
	if (sat69bMatches.length > 0) {
		y = drawMatchTable(doc, y, sat69bMatches, t);
	}

	// --- PEP Official (persons only; feature flag + omit when skipped) ---
	if (
		data.entityType !== "organization" &&
		features.pepSearch &&
		data.pepOfficialStatus !== "skipped"
	) {
		const pepOfficialRaw = data.pepOfficialResult as PepRawResult[] | null;
		const pepOfficialHas =
			Array.isArray(pepOfficialRaw) && pepOfficialRaw.length > 0;
		const pepOfficialStatusColor =
			data.pepOfficialStatus === "completed" && pepOfficialHas
				? COLORS.red
				: data.pepOfficialStatus === "completed"
					? COLORS.green
					: data.pepOfficialStatus === "failed"
						? COLORS.yellow
						: COLORS.gray;
		const pepOfficialStatusText =
			data.pepOfficialStatus === "completed" && pepOfficialHas
				? `${pepOfficialRaw!.length} ${t("pdfMatchesFound")}`
				: getStatusLabel(data.pepOfficialStatus, t);

		y = drawSectionHeader(
			doc,
			y,
			`PEP – ${language === "es" ? "Oficial" : "Official"}`,
			pepOfficialStatusText,
			pepOfficialStatusColor,
		);

		if (pepOfficialHas) {
			for (const result of pepOfficialRaw!.slice(0, 15)) {
				y = ensureSpace(doc, y, 12);
				doc.setFont("helvetica", "bold");
				doc.setFontSize(8);
				doc.setTextColor(...COLORS.primary);
				doc.text(result.nombre, MARGIN + 4, y + 4);

				if (result.informacionPrincipal?.cargo) {
					doc.setFont("helvetica", "normal");
					doc.setTextColor(...COLORS.gray);
					doc.text(result.informacionPrincipal.cargo, MARGIN + 4, y + 8);
				}
				y += 10;
			}
		}
	}

	// --- PEP AI (Grok) — persons only; omit when skipped (same as PEP Official) ---
	if (
		data.entityType !== "organization" &&
		features.pepGrok &&
		data.pepAiStatus !== "skipped"
	) {
		const pepAiRaw = data.pepAiResult as GrokPepResult | null;
		const pepAiHas = pepAiRaw && pepAiRaw.probability > 0;
		const pepAiStatusColor =
			data.pepAiStatus === "completed" && pepAiHas
				? COLORS.red
				: data.pepAiStatus === "completed"
					? COLORS.green
					: data.pepAiStatus === "failed"
						? COLORS.yellow
						: COLORS.gray;
		const pepAiStatusText =
			data.pepAiStatus === "completed" && pepAiHas
				? `${t("pdfProbability")}: ${Math.round(pepAiRaw!.probability * 100)}%`
				: getStatusLabel(data.pepAiStatus, t);

		y = drawSectionHeader(
			doc,
			y,
			t("pepAiSubtitle"),
			pepAiStatusText,
			pepAiStatusColor,
		);

		if (pepAiRaw && pepAiRaw.summary) {
			y = ensureSpace(doc, y, 15);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(7.5);
			doc.setTextColor(...COLORS.primary);
			const summaryText = getBilingualText(pepAiRaw.summary, language);
			const lines = doc.splitTextToSize(summaryText, CONTENT_WIDTH - 8);
			doc.text(lines, MARGIN + 4, y + 4);
			y += lines.length * 3.5 + 4;
		}

		if (pepAiRaw?.sources && pepAiRaw.sources.length > 0) {
			y = drawSources(doc, y, pepAiRaw.sources, t, faviconMap);
		}
	}

	// --- Adverse Media ---
	if (features.adverseMedia) {
		const adverseRaw = data.adverseMediaResult as AdverseMediaResult | null;
		const adverseHasRisk = adverseRaw && adverseRaw.risk_level !== "none";
		const adverseStatusColor =
			data.adverseMediaStatus === "completed" && adverseHasRisk
				? COLORS.red
				: data.adverseMediaStatus === "completed"
					? COLORS.green
					: data.adverseMediaStatus === "failed"
						? COLORS.yellow
						: COLORS.gray;
		const adverseStatusText =
			data.adverseMediaStatus === "completed" && adverseHasRisk
				? `${t("pdfRiskLevel")}: ${getAdverseMediaRiskLevelLabel(adverseRaw!.risk_level, t)}`
				: getStatusLabel(data.adverseMediaStatus, t);

		y = drawSectionHeader(
			doc,
			y,
			language === "es" ? "Medios Adversos" : "Adverse Media",
			adverseStatusText,
			adverseStatusColor,
		);

		if (adverseRaw && adverseRaw.findings) {
			y = ensureSpace(doc, y, 15);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(7.5);
			doc.setTextColor(...COLORS.primary);
			const findingsText = getBilingualText(adverseRaw.findings, language);
			const lines = doc.splitTextToSize(findingsText, CONTENT_WIDTH - 8);
			doc.text(lines, MARGIN + 4, y + 4);
			y += lines.length * 3.5 + 4;
		}

		if (adverseRaw?.sources && adverseRaw.sources.length > 0) {
			y = drawSources(doc, y, adverseRaw.sources, t, faviconMap);
		}
	}

	// --- Legal disclaimer fineprint (same copy as app footer) ---
	const disclaimerText = t("legalDisclaimerFinePrint");
	doc.setFont("helvetica", "italic");
	doc.setFontSize(5.5);
	doc.setTextColor(...COLORS.gray);
	const disclaimerLines = doc.splitTextToSize(disclaimerText, CONTENT_WIDTH);
	const lineStepMm = 2.5;

	y = ensureSpace(doc, y, 8);
	doc.setDrawColor(...COLORS.border);
	doc.setLineWidth(0.2);
	doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
	y += 4;

	for (const line of disclaimerLines) {
		y = ensureSpace(doc, y, lineStepMm + 1);
		doc.text(line, MARGIN, y);
		y += lineStepMm;
	}

	y += 4;

	// --- Footer ---
	const pageHeight = doc.internal.pageSize.getHeight();
	const footerY = pageHeight - 15;

	doc.setDrawColor(...COLORS.border);
	doc.setLineWidth(0.3);
	doc.line(MARGIN, footerY - 3, MARGIN + CONTENT_WIDTH, footerY - 3);

	doc.setFont("helvetica", "normal");
	doc.setFontSize(7);
	doc.setTextColor(...COLORS.gray);
	doc.text(
		`${t("pdfGeneratedAt")}: ${new Date().toLocaleString()}`,
		MARGIN,
		footerY + 1,
	);

	doc.setFontSize(7);
	const poweredByLabel = `${t("pdfPoweredBy")} `;
	const brandText = "Janovix";

	doc.setFont("helvetica", "normal");
	doc.setTextColor(...COLORS.gray);
	const prefixW = doc.getTextWidth(poweredByLabel);

	doc.setFont("helvetica", "bold");
	doc.setTextColor(...COLORS.primary);
	const brandW = doc.getTextWidth(brandText);

	const footerRightBlockW = prefixW + brandW;
	const footerRightStartX = MARGIN + CONTENT_WIDTH - footerRightBlockW;

	doc.setFont("helvetica", "normal");
	doc.setTextColor(...COLORS.gray);
	doc.text(poweredByLabel, footerRightStartX, footerY + 1);

	doc.setFont("helvetica", "bold");
	doc.setTextColor(37, 99, 235);
	const janovixTextX = footerRightStartX + prefixW;
	doc.text(brandText, janovixTextX, footerY + 1);
	doc.link(janovixTextX, footerY - 2, brandW, 5, {
		url: "https://janovix.com",
	});

	// --- Save ---
	const safeName = data.query.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
	const dateStr = new Date().toISOString().split("T")[0];
	doc.save(`screening-${safeName}-${dateStr}.pdf`);
}
