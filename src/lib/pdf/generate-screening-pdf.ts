import { jsPDF } from "jspdf";
import type { SearchQuery, QueryStatus } from "@/lib/api/queries";
import type {
	OfacMatch,
	UnscMatch,
	Sat69bMatch,
} from "@/lib/api/watchlist-search";
import type { Language, translations } from "@/lib/translations";

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

	for (const src of sources) {
		y = ensureSpace(doc, y, 5);
		const isLink = looksLikeUrl(src);
		if (isLink) {
			const href = ensureProtocol(src);
			doc.setTextColor(37, 99, 235);
			const displayText = src.length > 90 ? src.substring(0, 90) + "…" : src;
			const lines = doc.splitTextToSize(displayText, CONTENT_WIDTH - 8);
			doc.text(lines, MARGIN + 4, y);
			doc.link(MARGIN + 4, y - 3.5, CONTENT_WIDTH - 8, lines.length * 3.8, {
				url: href,
			});
			y += lines.length * 3.8 + 1;
		} else {
			doc.setTextColor(...COLORS.gray);
			const lines = doc.splitTextToSize(src, CONTENT_WIDTH - 8);
			doc.text(lines, MARGIN + 4, y);
			y += lines.length * 3.8 + 1;
		}
	}

	return y + 2;
}

export async function generateScreeningPdf(
	data: SearchQuery,
	org: OrgInfo,
	language: Language,
	t: TranslationFn,
): Promise<void> {
	const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
	let y = MARGIN;

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

	// --- Query metadata ---
	doc.setFontSize(9);
	doc.setTextColor(...COLORS.gray);

	const metaLeft = [
		[t("pdfSubject"), data.query.toUpperCase()],
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
	];
	const metaRight = [
		[t("pdfDate"), new Date(data.createdAt).toLocaleDateString()],
		[
			t("pdfStatus"),
			data.status.charAt(0).toUpperCase() + data.status.slice(1),
		],
	];

	// Left column value X: after longest label (e.g. "Fecha de nacimiento:") to avoid overlap
	const metaLeftValueX = 72;
	const metaRows = Math.max(metaLeft.length, metaRight.length);
	for (let i = 0; i < metaRows; i++) {
		y = ensureSpace(doc, y, 6);
		if (metaLeft[i]) {
			doc.setFont("helvetica", "bold");
			doc.setTextColor(...COLORS.gray);
			doc.text(`${metaLeft[i][0]}:`, MARGIN, y);
			doc.setFont("helvetica", "normal");
			doc.setTextColor(...COLORS.primary);
			doc.text(metaLeft[i][1], metaLeftValueX, y);
		}
		if (metaRight[i]) {
			doc.setFont("helvetica", "bold");
			doc.setTextColor(...COLORS.gray);
			doc.text(`${metaRight[i][0]}:`, MARGIN + 100, y);
			doc.setFont("helvetica", "normal");
			doc.setTextColor(...COLORS.primary);
			doc.text(metaRight[i][1], MARGIN + 120, y);
		}
		y += 5;
	}

	// Full-width ID row so the complete UUID is visible
	y = ensureSpace(doc, y, 6);
	doc.setFont("helvetica", "bold");
	doc.setFontSize(9);
	doc.setTextColor(...COLORS.gray);
	doc.text(`${t("pdfQueryId")}:`, MARGIN, y);
	doc.setFont("helvetica", "normal");
	doc.setTextColor(...COLORS.primary);
	doc.text(data.id, MARGIN + 30, y);
	y += 10;

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

	// --- PEP Official (omit section when skipped) ---
	if (data.pepOfficialStatus !== "skipped") {
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

	// --- PEP AI (Grok) ---
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

	if (pepAiHas && pepAiRaw!.summary) {
		y = ensureSpace(doc, y, 15);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.setTextColor(...COLORS.primary);
		const summaryText = getBilingualText(pepAiRaw!.summary, language);
		const lines = doc.splitTextToSize(summaryText, CONTENT_WIDTH - 8);
		doc.text(lines, MARGIN + 4, y + 4);
		y += lines.length * 3.5 + 4;
	}

	if (pepAiHas && pepAiRaw!.sources && pepAiRaw!.sources.length > 0) {
		y = drawSources(doc, y, pepAiRaw!.sources, t);
	}

	// --- Adverse Media ---
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
			? `${t("pdfRiskLevel")}: ${adverseRaw!.risk_level.toUpperCase()}`
			: getStatusLabel(data.adverseMediaStatus, t);

	y = drawSectionHeader(
		doc,
		y,
		language === "es" ? "Medios Adversos" : "Adverse Media",
		adverseStatusText,
		adverseStatusColor,
	);

	if (adverseHasRisk && adverseRaw!.findings) {
		y = ensureSpace(doc, y, 15);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.setTextColor(...COLORS.primary);
		const findingsText = getBilingualText(adverseRaw!.findings, language);
		const lines = doc.splitTextToSize(findingsText, CONTENT_WIDTH - 8);
		doc.text(lines, MARGIN + 4, y + 4);
		y += lines.length * 3.5 + 4;
	}

	if (adverseHasRisk && adverseRaw!.sources && adverseRaw!.sources.length > 0) {
		y = drawSources(doc, y, adverseRaw!.sources, t);
	}

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

	doc.setTextColor(...COLORS.gray);
	doc.text(`${t("pdfPoweredBy")} `, MARGIN + CONTENT_WIDTH - 28, footerY + 1);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(...COLORS.primary);
	doc.text("Janovix", MARGIN + CONTENT_WIDTH - 14, footerY + 1);

	// --- Save ---
	const safeName = data.query.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
	const dateStr = new Date().toISOString().split("T")[0];
	doc.save(`screening-${safeName}-${dateStr}.pdf`);
}
