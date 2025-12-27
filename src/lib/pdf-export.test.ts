import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportResultToPdf } from "./pdf-export";
import type { PEPResult } from "./mock-data";

// Mock jsPDF
const mockSave = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockText = vi.fn();
const mockSplitTextToSize = vi.fn((text: string) => [text]);
const mockAddPage = vi.fn();
const mockGetNumberOfPages = vi.fn(() => 1);
const mockSetPage = vi.fn();

let mockPageHeight = 297;

vi.mock("jspdf", () => {
	class MockJsPDF {
		internal = {
			pageSize: {
				getWidth: () => 210,
				getHeight: () => mockPageHeight,
			},
		};
		setFontSize = mockSetFontSize;
		setFont = mockSetFont;
		text = mockText;
		splitTextToSize = mockSplitTextToSize;
		addPage = mockAddPage;
		getNumberOfPages = mockGetNumberOfPages;
		setPage = mockSetPage;
		save = mockSave;
	}

	return {
		jsPDF: MockJsPDF,
	};
});

describe("exportResultToPdf", () => {
	const mockTranslations = {
		appName: "isPep",
		byJanovix: "Janovix",
		isPep: "Is PEP",
		isNotPep: "Not PEP",
		isPepDescription: "This person is or has been a PEP",
		isNotPepDescription: "No records found",
		searchInfo: "Search information",
		searchedName: "Searched name:",
		queryDate: "Query date:",
		queryId: "Query ID:",
		pepRecordDetails: "PEP record details",
		dataset: "Dataset",
		recordId: "Record ID",
		registeredName: "Registered name",
		aliases: "Aliases",
		birthDate: "Birth date",
		countries: "Countries",
		firstSeen: "First seen",
		lastChange: "Last change",
		lastSeen: "Last seen",
		noAliases: "No aliases",
		noCountries: "No countries",
	};

	const mockPepResult: PEPResult = {
		id: "test-id-123",
		searchName: "John Doe",
		isPep: true,
		timestamp: new Date("2024-01-15T10:30:00Z"),
		record: {
			dataset: "OFAC",
			id: "OFAC-12345",
			name: "John Doe",
			aliases: ["J. Doe", "Johnny"],
			birthDate: "1980-05-15",
			countries: ["US", "CA"],
			firstSeen: "2020-01-01T00:00:00Z",
			lastChange: "2023-12-01T00:00:00Z",
			lastSeen: "2024-01-10T00:00:00Z",
			currentPosition: "Executive Director",
		},
		confidence: "high",
		currentPosition: "Executive Director",
		evidence: ["Name match", "Date match"],
		reasoning: "Strong match found in database",
		source: "watchlist",
	};

	const mockNonPepResult: PEPResult = {
		id: "test-id-456",
		searchName: "Jane Smith",
		isPep: false,
		timestamp: new Date("2024-01-15T10:30:00Z"),
		record: null,
		confidence: "low",
		currentPosition: null,
		evidence: [],
		reasoning: "No matches found",
		source: "watchlist",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockSave.mockClear();
		mockSetFontSize.mockClear();
		mockSetFont.mockClear();
		mockText.mockClear();
		mockSplitTextToSize.mockClear();
		mockAddPage.mockClear();
		mockGetNumberOfPages.mockClear();
		mockSetPage.mockClear();
		mockPageHeight = 297; // Reset to default
		// Restore any Date prototype spies
		vi.restoreAllMocks();
	});

	it("should create a PDF document for PEP result", () => {
		exportResultToPdf(mockPepResult, mockTranslations, "en-US");

		expect(mockSave).toHaveBeenCalled();
	});

	it("should create a PDF document for non-PEP result", () => {
		exportResultToPdf(mockNonPepResult, mockTranslations, "en-US");

		expect(mockSave).toHaveBeenCalled();
	});

	it("should call save with correct filename format", async () => {
		exportResultToPdf(mockPepResult, mockTranslations, "en-US");

		expect(mockSave).toHaveBeenCalled();
		const saveCall = mockSave.mock.calls[0]?.[0];
		expect(saveCall).toContain("pep_result_");
		expect(saveCall).toContain("test-id-123");
		expect(saveCall).toContain(".pdf");
	});

	it("should handle result with null dates", () => {
		const resultWithNullDates: PEPResult = {
			...mockPepResult,
			record: {
				...mockPepResult.record!,
				birthDate: null,
				firstSeen: null,
				lastChange: null,
				lastSeen: null,
			},
		};

		expect(() => {
			exportResultToPdf(resultWithNullDates, mockTranslations, "en-US");
		}).not.toThrow();
	});

	it("should handle result with empty aliases and countries", () => {
		const resultWithEmptyArrays: PEPResult = {
			...mockPepResult,
			record: {
				...mockPepResult.record!,
				aliases: [],
				countries: [],
			},
		};

		expect(() => {
			exportResultToPdf(resultWithEmptyArrays, mockTranslations, "en-US");
		}).not.toThrow();
	});

	it("should sanitize filename correctly", () => {
		const resultWithSpecialChars: PEPResult = {
			...mockPepResult,
			searchName: "John Doe & Associates!@#$%",
		};

		exportResultToPdf(resultWithSpecialChars, mockTranslations, "en-US");

		const saveCall = mockSave.mock.calls[0]?.[0];
		// Check that special characters are replaced with underscores in filename
		expect(saveCall).toMatch(/pep_result_John_Doe.*\.pdf/);
	});

	it("should handle invalid date strings gracefully", () => {
		const resultWithInvalidDates: PEPResult = {
			...mockPepResult,
			record: {
				...mockPepResult.record!,
				birthDate: "invalid-date-string",
				firstSeen: "not-a-date",
				lastChange: "also-invalid",
				lastSeen: "bad-date-format",
			},
		};

		expect(() => {
			exportResultToPdf(resultWithInvalidDates, mockTranslations, "en-US");
		}).not.toThrow();
		expect(mockSave).toHaveBeenCalled();
	});

	it("should add a new page when content exceeds page height", () => {
		// Set a small page height to trigger page break
		mockPageHeight = 100;
		mockGetNumberOfPages.mockReturnValue(2);

		// Create a result with many items to push content down
		const resultWithManyItems: PEPResult = {
			...mockPepResult,
			record: {
				...mockPepResult.record!,
				aliases: Array(20).fill("Very Long Alias Name That Takes Space"),
				countries: Array(15).fill("XX"),
			},
		};

		exportResultToPdf(resultWithManyItems, mockTranslations, "en-US");

		// Should have called addPage when content exceeds page height
		expect(mockAddPage).toHaveBeenCalled();
		expect(mockSave).toHaveBeenCalled();
	});

	it("should handle invalid date strings in formatDate catch block", () => {
		// Mock toLocaleDateString to throw an error to trigger catch block
		const originalToLocaleDateString = Date.prototype.toLocaleDateString;
		Date.prototype.toLocaleDateString = vi.fn(() => {
			throw new Error("Invalid date");
		});

		const resultWithInvalidBirthDate: PEPResult = {
			...mockPepResult,
			record: {
				...mockPepResult.record!,
				birthDate: "1980-05-15",
			},
		};

		expect(() => {
			exportResultToPdf(resultWithInvalidBirthDate, mockTranslations, "en-US");
		}).not.toThrow();
		expect(mockSave).toHaveBeenCalled();

		// Restore
		Date.prototype.toLocaleDateString = originalToLocaleDateString;
	});
});
