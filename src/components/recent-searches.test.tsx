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
			},
		},
		{
			id: "2",
			searchName: "Jane Smith",
			isPep: false,
			timestamp: new Date("2024-01-02"),
			record: null,
		},
	];

	it("should render nothing when searches array is empty", () => {
		const onSelectSearch = vi.fn();
		const { container } = renderWithProvider(
			<RecentSearches searches={[]} onSelectSearch={onSelectSearch} />,
		);

		expect(container.firstChild).toBeNull();
	});

	it("should render recent searches list", () => {
		const onSelectSearch = vi.fn();
		renderWithProvider(
			<RecentSearches
				searches={mockSearches}
				onSelectSearch={onSelectSearch}
			/>,
		);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
	});

	it("should call onSelectSearch when a search is clicked", () => {
		const onSelectSearch = vi.fn();
		renderWithProvider(
			<RecentSearches
				searches={mockSearches}
				onSelectSearch={onSelectSearch}
			/>,
		);

		const johnDoeButton = screen.getByText("John Doe").closest("button");
		if (johnDoeButton) {
			fireEvent.click(johnDoeButton);
		}

		expect(onSelectSearch).toHaveBeenCalledWith(mockSearches[0]);
	});

	it("should display PEP indicator for PEP results", () => {
		const onSelectSearch = vi.fn();
		renderWithProvider(
			<RecentSearches
				searches={mockSearches}
				onSelectSearch={onSelectSearch}
			/>,
		);

		// Should show "yes" or "Sí" for PEP results
		const pepBadge = screen
			.getByText("John Doe")
			.closest("button")
			?.querySelector(".text-destructive");
		expect(pepBadge).toBeInTheDocument();
	});

	it("should display non-PEP indicator for non-PEP results", () => {
		const onSelectSearch = vi.fn();
		renderWithProvider(
			<RecentSearches
				searches={mockSearches}
				onSelectSearch={onSelectSearch}
			/>,
		);

		// Should show "no" or "No" for non-PEP results
		const nonPepBadge = screen
			.getByText("Jane Smith")
			.closest("button")
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
		}));

		const onSelectSearch = vi.fn();
		renderWithProvider(
			<RecentSearches
				searches={manySearches}
				onSelectSearch={onSelectSearch}
			/>,
		);

		const buttons = screen.getAllByRole("button");
		// Should only show 5 searches
		expect(buttons.length).toBeLessThanOrEqual(5);
	});

	it("should display formatted timestamp", () => {
		const onSelectSearch = vi.fn();
		renderWithProvider(
			<RecentSearches
				searches={mockSearches}
				onSelectSearch={onSelectSearch}
			/>,
		);

		// Timestamp should be displayed
		const timestamp = screen
			.getByText("John Doe")
			.closest("button")
			?.querySelector(".text-xs");
		expect(timestamp).toBeInTheDocument();
	});
});
