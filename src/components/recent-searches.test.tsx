import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { RecentSearches } from "./recent-searches";
import { LanguageProvider } from "./language-provider";
import type { PEPResult } from "@/lib/mock-data";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("RecentSearches", () => {
	afterEach(() => {
		cleanup();
	});

	const mockSearches: PEPResult[] = [
		{
			id: "1",
			searchName: "John Doe",
			isPep: true,
			timestamp: new Date("2024-01-01"),
			record: {
				dataset: "OFAC",
				id: "OFAC-123",
				name: "John Doe",
				aliases: [],
				birthDate: null,
				countries: [],
				firstSeen: null,
				lastChange: null,
				lastSeen: null,
				currentPosition: null,
			},
			confidence: "high",
			currentPosition: null,
			evidence: ["Name match"],
			reasoning: "Match found in database",
			source: "watchlist",
		},
		{
			id: "2",
			searchName: "Jane Smith",
			isPep: false,
			timestamp: new Date("2024-01-02"),
			record: null,
			confidence: "low",
			currentPosition: null,
			evidence: [],
			reasoning: "No matches found",
			source: "watchlist",
		},
	];

	it("should render call-to-action when searches array is empty", () => {
		const handleStartSearch = vi.fn();
		renderWithProvider(
			<RecentSearches searches={[]} onStartSearch={handleStartSearch} />,
		);

		// Should show the call-to-action message
		expect(screen.getByText(/no recent searches/i)).toBeInTheDocument();
		expect(
			screen.getByText(/start your first/i) ||
				screen.getByText(/realiza tu primera/i) ||
				screen.getByText(/comece sua primeira/i),
		).toBeInTheDocument();

		// Should have a button to start search
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();

		// Clicking the button should call onStartSearch
		fireEvent.click(button);
		expect(handleStartSearch).toHaveBeenCalledTimes(1);
	});

	it("should render recent searches list", () => {
		renderWithProvider(<RecentSearches searches={mockSearches} />);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
	});

	it("should render links to query pages", () => {
		renderWithProvider(<RecentSearches searches={mockSearches} />);

		const johnDoeLink = screen.getByText("John Doe").closest("a");
		expect(johnDoeLink).toHaveAttribute("href", "/1");

		const janeSmithLink = screen.getByText("Jane Smith").closest("a");
		expect(janeSmithLink).toHaveAttribute("href", "/2");
	});

	it("should display PEP indicator for PEP results", () => {
		renderWithProvider(<RecentSearches searches={mockSearches} />);

		// Should show "yes" or "Sí" for PEP results
		const pepBadge = screen
			.getByText("John Doe")
			.closest("a")
			?.querySelector(".text-destructive");
		expect(pepBadge).toBeInTheDocument();
	});

	it("should display non-PEP indicator for non-PEP results", () => {
		renderWithProvider(<RecentSearches searches={mockSearches} />);

		// Should show "no" or "No" for non-PEP results
		const nonPepBadge = screen
			.getByText("Jane Smith")
			.closest("a")
			?.querySelector(".text-green-600");
		expect(nonPepBadge).toBeInTheDocument();
	});

	it("should limit displayed searches to 5", () => {
		const manySearches: PEPResult[] = Array.from({ length: 10 }, (_, i) => ({
			id: `${i}`,
			searchName: `Person ${i}`,
			isPep: false,
			timestamp: new Date(),
			record: null,
			confidence: "low",
			currentPosition: null,
			evidence: [],
			reasoning: "No matches found",
			source: "watchlist",
		}));

		renderWithProvider(<RecentSearches searches={manySearches} />);

		const links = screen.getAllByRole("link");
		// Should only show 5 searches
		expect(links.length).toBeLessThanOrEqual(5);
	});

	it("should display formatted timestamp", () => {
		renderWithProvider(<RecentSearches searches={mockSearches} />);

		// Timestamp should be displayed
		const timestamp = screen
			.getByText("John Doe")
			.closest("a")
			?.querySelector(".text-xs");
		expect(timestamp).toBeInTheDocument();
	});
});
