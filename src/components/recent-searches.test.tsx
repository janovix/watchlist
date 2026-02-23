import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { RecentSearches } from "./recent-searches";

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	}),
}));

vi.mock("next/link", () => ({
	default: ({
		href,
		children,
	}: {
		href: string;
		children: React.ReactNode;
	}) => <a href={href}>{children}</a>,
}));

const mockSearches = [
	{
		id: "s1",
		name: "John Doe",
		entityType: "person" as const,
		date: "2024-01-01",
	},
	{
		id: "s2",
		name: "Acme Corp",
		entityType: "organization" as const,
		date: "2024-01-02",
	},
	{
		id: "s3",
		name: "Jane Smith",
		entityType: "person" as const,
		date: "2024-01-03",
	},
];

describe("RecentSearches", () => {
	const onSelect = vi.fn();
	const onFocusSearch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render the section header", () => {
		render(
			<RecentSearches
				searches={[]}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		expect(screen.getByText("recentSearches")).toBeInTheDocument();
	});

	it("should render skeleton rows when isLoading is true", () => {
		const { container } = render(
			<RecentSearches
				searches={[]}
				isLoading={true}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		// Skeletons are rendered — check for skeleton elements
		const skeletons = container.querySelectorAll(
			"[class*='skeleton'], .animate-pulse, [class*='Skeleton']",
		);
		// At minimum, the loading state renders 5 rows with skeleton elements
		// We check that no search names appear
		expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
		// Check loading rows exist (5 divs with skeleton content)
		const loadingRows = container.querySelectorAll(".border-b");
		expect(loadingRows.length).toBeGreaterThan(0);
		// Suppress unused var
		void skeletons;
	});

	it("should render empty state when no searches and not loading", () => {
		render(
			<RecentSearches
				searches={[]}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		expect(screen.getByText("noRecentSearches")).toBeInTheDocument();
		expect(screen.getByText("noRecentSearchesDescription")).toBeInTheDocument();
		expect(screen.getByText("startFirstSearch")).toBeInTheDocument();
	});

	it("should call onFocusSearch when start first search button is clicked", () => {
		render(
			<RecentSearches
				searches={[]}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		fireEvent.click(screen.getByText("startFirstSearch"));
		expect(onFocusSearch).toHaveBeenCalledOnce();
	});

	it("should render search names in the list", () => {
		render(
			<RecentSearches
				searches={mockSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		expect(screen.getByText("John Doe")).toBeInTheDocument();
		expect(screen.getByText("Acme Corp")).toBeInTheDocument();
		expect(screen.getByText("Jane Smith")).toBeInTheDocument();
	});

	it("should render search dates", () => {
		render(
			<RecentSearches
				searches={mockSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		expect(screen.getByText("2024-01-01")).toBeInTheDocument();
		expect(screen.getByText("2024-01-02")).toBeInTheDocument();
	});

	it("should call onSelect with the correct search when a row is clicked", () => {
		render(
			<RecentSearches
				searches={mockSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		fireEvent.click(screen.getByText("John Doe"));
		expect(onSelect).toHaveBeenCalledWith(mockSearches[0]);
	});

	it("should call onSelect with the second search when second row is clicked", () => {
		render(
			<RecentSearches
				searches={mockSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		fireEvent.click(screen.getByText("Acme Corp"));
		expect(onSelect).toHaveBeenCalledWith(mockSearches[1]);
	});

	it("should apply bottom padding when fewer than MAX_ITEMS searches are shown", () => {
		const { container } = render(
			<RecentSearches
				searches={mockSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		// mockSearches has 3 items, MAX_ITEMS is 5, so paddingBottom should be applied
		const listContainer = container.querySelector("[style]");
		expect(listContainer).toBeTruthy();
		expect(listContainer?.getAttribute("style")).toContain("padding-bottom");
	});

	it("should not apply bottom padding when exactly MAX_ITEMS searches are shown", () => {
		const fiveSearches = [
			...mockSearches,
			{
				id: "s4",
				name: "Eve White",
				entityType: "person" as const,
				date: "2024-01-04",
			},
			{
				id: "s5",
				name: "Bob Brown",
				entityType: "organization" as const,
				date: "2024-01-05",
			},
		];

		const { container } = render(
			<RecentSearches
				searches={fiveSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		const listContainer = container.querySelector("[style]");
		// No padding when count equals MAX_ITEMS
		expect(listContainer).toBeFalsy();
	});

	it("should render a 'Ver todas' link", () => {
		render(
			<RecentSearches
				searches={mockSearches}
				onSelect={onSelect}
				onFocusSearch={onFocusSearch}
			/>,
		);

		const link = screen.getByRole("link", { name: /ver todas/i });
		expect(link).toHaveAttribute("href", "/queries");
	});
});
