import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MatchResultsList } from "./match-results-list";
import { LanguageProvider } from "./language-provider";
import type { WatchlistMatch } from "@/lib/api/watchlist-search";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("MatchResultsList", () => {
	afterEach(() => {
		cleanup();
	});

	it("should show empty state when no matches", () => {
		renderWithProvider(<MatchResultsList matches={[]} />);

		expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
	});

	it("should show match count when matches exist", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Juan Perez",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.95,
				breakdown: {
					vectorScore: 0.92,
					nameScore: 0.98,
					metaScore: 1.0,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		expect(screen.getByText("Juan Perez")).toBeInTheDocument();
		expect(screen.getByText(/found/i)).toBeInTheDocument();
	});

	it("should display score percentage", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Test Person",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.8,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		const percentages = screen.getAllByText(/85%/);
		expect(percentages.length).toBeGreaterThan(0);
	});

	it("should show identifier match badge when applicable", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Test Person",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 1.0,
				breakdown: {
					vectorScore: 0.85,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: true,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		expect(screen.getByText(/identifier match/i)).toBeInTheDocument();
	});

	it("should expand and collapse details", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Test Person",
					aliases: ["Alias 1"],
					birthDate: "1980-01-15",
					countries: ["MX"],
					addresses: ["123 Main St"],
					identifiers: [{ type: "R.F.C.", number: "HEMA-621127" }],
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.95,
				breakdown: {
					vectorScore: 0.92,
					nameScore: 0.98,
					metaScore: 1.0,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// Initially details should not be visible
		expect(screen.queryByText("1980-01-15")).not.toBeInTheDocument();

		// Click expand button
		const expandButton = screen.getByText(/view details/i);
		fireEvent.click(expandButton);

		// Details should now be visible
		expect(screen.getByText("1980-01-15")).toBeInTheDocument();
		expect(screen.getByText("R.F.C.: HEMA-621127")).toBeInTheDocument();
	});

	it("should display multiple matches", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Person 1",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.95,
				breakdown: {
					vectorScore: 0.92,
					nameScore: 0.98,
					metaScore: 1.0,
					identifierMatch: false,
				},
			},
			{
				target: {
					id: "test-2",
					schema: null,
					name: "Person 2",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.8,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		expect(screen.getByText("Person 1")).toBeInTheDocument();
		expect(screen.getByText("Person 2")).toBeInTheDocument();
		// Check for match count in the summary
		expect(screen.getByText(/2.*found/i)).toBeInTheDocument();
	});

	it("should display high match badge for scores > 0.75", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "High Match Person",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.82,
					nameScore: 0.88,
					metaScore: 0.8,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);
		const highMatchElements = screen.getAllByText(/high match/i);
		expect(highMatchElements.length).toBeGreaterThan(0);
	});

	it("should display medium match badge for scores between 0.51 and 0.75", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Medium Match Person",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.65,
				breakdown: {
					vectorScore: 0.6,
					nameScore: 0.7,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);
		const mediumMatchElements = screen.getAllByText(/medium match/i);
		expect(mediumMatchElements.length).toBeGreaterThan(0);
	});

	it("should display low match badge for scores <= 0.5", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Low Match Person",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.45,
				breakdown: {
					vectorScore: 0.4,
					nameScore: 0.5,
					metaScore: 0.3,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);
		const lowMatchElements = screen.getAllByText(/low match/i);
		expect(lowMatchElements.length).toBeGreaterThan(0);
	});

	it("should handle match with null name by displaying 'Unknown'", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: null,
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.8,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);
		expect(screen.getByText("Unknown")).toBeInTheDocument();
	});

	it("should display all expanded fields when available", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Full Details Person",
					aliases: ["Alias 1", "Alias 2"],
					birthDate: "1980-01-15",
					countries: ["MX", "US"],
					addresses: ["123 Main St", "456 Oak Ave"],
					identifiers: [
						{ type: "R.F.C.", number: "HEMA-621127" },
						{ type: "Passport", number: "ID-123456" },
					],
					sanctions: ["OFAC SDN", "EU Sanctions"],
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.95,
				breakdown: {
					vectorScore: 0.92,
					nameScore: 0.98,
					metaScore: 1.0,
					identifierMatch: true,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// Expand details
		const expandButton = screen.getByText(/view details/i);
		fireEvent.click(expandButton);

		// Check all expanded fields are visible
		expect(screen.getByText("1980-01-15")).toBeInTheDocument();
		expect(screen.getByText(/MX, US/)).toBeInTheDocument();
		expect(screen.getByText(/HEMA-621127/)).toBeInTheDocument();
		expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
		expect(screen.getByText(/OFAC SDN/)).toBeInTheDocument();
		expect(screen.getByText("test-1")).toBeInTheDocument();
	});

	it("should not display optional fields when they are null or empty", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Minimal Person",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: null,
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.75,
				breakdown: {
					vectorScore: 0.7,
					nameScore: 0.8,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// Expand details
		const expandButton = screen.getByText(/view details/i);
		fireEvent.click(expandButton);

		// These fields should not be visible
		expect(screen.queryByText(/Birth date:/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Countries:/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Identifiers:/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Addresses:/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/Sanctions:/i)).not.toBeInTheDocument();
	});

	it("should collapse details when collapse button is clicked", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Test Person",
					aliases: null,
					birthDate: "1980-01-15",
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.8,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// Expand first
		const expandButton = screen.getByText(/view details/i);
		fireEvent.click(expandButton);
		expect(screen.getByText("1980-01-15")).toBeInTheDocument();

		// Now collapse
		const collapseButton = screen.getByText(/hide details/i);
		fireEvent.click(collapseButton);
		expect(screen.queryByText("1980-01-15")).not.toBeInTheDocument();
	});

	it("should display highest score in summary when multiple matches", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Person 1",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.8,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
			{
				target: {
					id: "test-2",
					schema: null,
					name: "Person 2",
					aliases: null,
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.92,
				breakdown: {
					vectorScore: 0.9,
					nameScore: 0.95,
					metaScore: 0.8,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// The highest score should be displayed in the summary
		// Look for the specific text that contains "Highest match" (from translations)
		expect(screen.getByText(/highest match/i)).toBeInTheDocument();
		const allScoreElements = screen.getAllByText(/92%/);
		expect(allScoreElements.length).toBeGreaterThan(0);
	});

	it("should not display aliases section when aliases array is empty", () => {
		const mockMatches: WatchlistMatch[] = [
			{
				target: {
					id: "test-1",
					schema: null,
					name: "Test Person",
					aliases: [],
					birthDate: null,
					countries: null,
					addresses: null,
					identifiers: null,
					sanctions: null,
					phones: null,
					emails: null,
					programIds: null,
					dataset: "ofac_sdn",
					firstSeen: null,
					lastSeen: null,
					lastChange: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.85,
				breakdown: {
					vectorScore: 0.8,
					nameScore: 0.9,
					metaScore: 0.5,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);
		expect(screen.queryByText(/Aliases:/)).not.toBeInTheDocument();
	});
});
