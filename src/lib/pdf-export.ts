import { jsPDF } from "jspdf";
import type { PEPResult } from "@/lib/mock-data";

function formatDate(dateString: string | null, locale: string): string {
	if (!dateString) return "—";
	try {
		return new Date(dateString).toLocaleDateString(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return dateString;
	}
}

function formatDateTime(dateString: string | null, locale: string): string {
	if (!dateString) return "—";
	try {
		return new Date(dateString).toLocaleString(locale, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
}

export function exportResultToPdf(
	result: PEPResult,
	translations: Record<string, string>,
	locale: string,
): void {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 20;
	const maxWidth = pageWidth - 2 * margin;
	let yPosition = margin;

	// Helper function to add text with word wrap
	const addText = (
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		fontSize: number = 12,
		fontStyle: "normal" | "bold" = "normal",
	): number => {
		doc.setFontSize(fontSize);
		doc.setFont("helvetica", fontStyle);
		const lines = doc.splitTextToSize(text, maxWidth);
		doc.text(lines, x, y);
		return y + lines.length * (fontSize * 0.4);
	};

	// Title
	doc.setFontSize(18);
	doc.setFont("helvetica", "bold");
	doc.text(translations.appName || "isPep", margin, yPosition);
	yPosition += 10;

	// Result Status Section
	const isPep = result.isPep;
	const statusText = isPep
		? translations.isPep || "Is PEP"
		: translations.isNotPep || "Not PEP";
	const statusDescription = isPep
		? translations.isPepDescription || ""
		: translations.isNotPepDescription || "";

	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.text(statusText, margin, yPosition);
	yPosition += 8;

	if (statusDescription) {
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		yPosition = addText(statusDescription, margin, yPosition, maxWidth, 10);
		yPosition += 5;
	}

	// Search Information Section
	yPosition += 5;
	doc.setFontSize(12);
	doc.setFont("helvetica", "bold");
	doc.text(translations.searchInfo || "Search information", margin, yPosition);
	yPosition += 8;

	doc.setFontSize(10);
	doc.setFont("helvetica", "normal");
	const searchedNameLabel = `${translations.searchedName || "Searched name:"} ${result.searchName}`;
	yPosition = addText(searchedNameLabel, margin, yPosition, maxWidth, 10);
	yPosition += 5;

	const queryDateLabel = `${translations.queryDate || "Query date:"} ${result.timestamp.toLocaleString(locale)}`;
	yPosition = addText(queryDateLabel, margin, yPosition, maxWidth, 10);
	yPosition += 5;

	const queryIdLabel = `${translations.queryId || "Query ID:"} ${result.id}`;
	yPosition = addText(queryIdLabel, margin, yPosition, maxWidth, 10);
	yPosition += 10;

	// PEP Record Details (only if isPep)
	if (isPep && result.record) {
		const record = result.record;

		// Check if we need a new page
		if (yPosition > pageHeight - 80) {
			doc.addPage();
			yPosition = margin;
		}

		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text(
			translations.pepRecordDetails || "PEP record details",
			margin,
			yPosition,
		);
		yPosition += 8;

		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");

		// Dataset and Record ID
		const datasetLabel = `${translations.dataset || "Dataset"}: ${record.dataset}`;
		yPosition = addText(datasetLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		const recordIdLabel = `${translations.recordId || "Record ID"}: ${record.id}`;
		yPosition = addText(recordIdLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		// Name
		const nameLabel = `${translations.registeredName || "Registered name"}: ${record.name}`;
		yPosition = addText(nameLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		// Aliases
		const aliasesText =
			record.aliases.length > 0
				? record.aliases.join(", ")
				: translations.noAliases || "No aliases";
		const aliasesLabel = `${translations.aliases || "Aliases"}: ${aliasesText}`;
		yPosition = addText(aliasesLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		// Birth Date
		const birthDateLabel = `${translations.birthDate || "Birth date"}: ${formatDate(record.birthDate, locale)}`;
		yPosition = addText(birthDateLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		// Countries
		const countriesText =
			record.countries.length > 0
				? record.countries.join(", ")
				: translations.noCountries || "No countries";
		const countriesLabel = `${translations.countries || "Countries"}: ${countriesText}`;
		yPosition = addText(countriesLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		// Timestamps
		const firstSeenLabel = `${translations.firstSeen || "First seen"}: ${formatDateTime(record.firstSeen, locale)}`;
		yPosition = addText(firstSeenLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		const lastChangeLabel = `${translations.lastChange || "Last change"}: ${formatDateTime(record.lastChange, locale)}`;
		yPosition = addText(lastChangeLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;

		const lastSeenLabel = `${translations.lastSeen || "Last seen"}: ${formatDateTime(record.lastSeen, locale)}`;
		yPosition = addText(lastSeenLabel, margin, yPosition, maxWidth, 10);
		yPosition += 5;
	}

	// Footer
	const totalPages = doc.getNumberOfPages();
	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setFont("helvetica", "normal");
		doc.text(
			`${translations.appName || "isPep"} - ${translations.byJanovix || "Janovix"}`,
			margin,
			pageHeight - 10,
		);
		doc.text(`${i} / ${totalPages}`, pageWidth - margin - 10, pageHeight - 10);
	}

	// Generate filename
	const sanitizedName = result.searchName.replace(/[^a-z0-9]/gi, "_");
	const filename = `pep_result_${sanitizedName}_${result.id}.pdf`;

	// Save the PDF
	doc.save(filename);
}
