import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MatchResultsList } from "./match-results-list";
import { LanguageProvider } from "./language-provider";
import type {
	OfacMatch,
	UnscMatch,
	Sat69bMatch,
} from "@/lib/api/watchlist-search";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("MatchResultsList", () => {
	afterEach(() => {
		cleanup();
	});

	it("should show low score match", () => {
		const mockMatches: OfacMatch[] = [
			{
				target: {
					id: "test-low",
					partyType: "Individual",
					primaryName: "Person Low",
					aliases: null,
					birthDate: null,
					birthPlace: null,
					addresses: null,
					identifiers: null,
					remarks: null,
					sourceList: "SDN",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.3,
				breakdown: {
					vectorScore: 0.28,
					nameScore: 0.32,
					metaScore: 0.3,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// Score 0.3 should have "low" risk level and "secondary" badge variant
		expect(screen.getByText("Person Low")).toBeInTheDocument();
	});

	it("should show medium score match", () => {
		const mockMatches: OfacMatch[] = [
			{
				target: {
					id: "test-medium",
					partyType: "Individual",
					primaryName: "Person Medium",
					aliases: null,
					birthDate: null,
					birthPlace: null,
					addresses: null,
					identifiers: null,
					remarks: null,
					sourceList: "SDN",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.6,
				breakdown: {
					vectorScore: 0.58,
					nameScore: 0.62,
					metaScore: 0.6,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		// Score 0.6 should have "medium" risk level and "default" badge variant
		expect(screen.getByText("Person Medium")).toBeInTheDocument();
	});

	it("should show OFAC match", () => {
		const mockMatches: OfacMatch[] = [
			{
				target: {
					id: "test-1",
					partyType: "Individual",
					primaryName: "Juan Perez",
					aliases: null,
					birthDate: null,
					birthPlace: null,
					addresses: null,
					identifiers: null,
					remarks: null,
					sourceList: "SDN",
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
		expect(screen.getByText("OFAC")).toBeInTheDocument();
	});

	it("should show UNSC match", () => {
		const mockMatches: UnscMatch[] = [
			{
				target: {
					id: "test-2",
					partyType: "Individual",
					primaryName: "Maria Garcia",
					aliases: ["Mary G"],
					birthDate: "1980-05-15",
					birthPlace: "Madrid, Spain",
					gender: "Female",
					nationalities: ["ES"],
					addresses: ["123 Main St"],
					identifiers: [{ type: "Passport", number: "ABC123" }],
					designations: ["Terrorism"],
					remarks: "Test remarks",
					unListType: "Al-Qaida",
					referenceNumber: "QDi.001",
					listedOn: "2020-01-01",
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

		expect(screen.getByText("Maria Garcia")).toBeInTheDocument();
		expect(screen.getByText("UNSC")).toBeInTheDocument();
	});

	it("should show SAT 69-B match", () => {
		const mockMatches: Sat69bMatch[] = [
			{
				target: {
					id: "test-3",
					rfc: "XAXX010101000",
					taxpayerName: "Empresa Test SA de CV",
					taxpayerStatus: "Definitivo",
					presumptionPhase: {
						satNotice: "69-B/2020",
						satDate: "2020-01-01",
						dofNotice: "DOF-001",
						dofDate: "2020-01-15",
					},
					rebuttalPhase: null,
					definitivePhase: null,
					favorablePhase: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
				score: 0.78,
				breakdown: {
					vectorScore: 0.75,
					nameScore: 0.82,
					metaScore: 0,
					identifierMatch: false,
				},
			},
		];

		renderWithProvider(<MatchResultsList matches={mockMatches} />);

		expect(screen.getByText("Empresa Test SA de CV")).toBeInTheDocument();
		expect(screen.getByText("SAT 69-B")).toBeInTheDocument();
	});

	it("should display high match badge for score > 0.75", () => {
		const mockMatches: OfacMatch[] = [
			{
				target: {
					id: "test-1",
					partyType: "Individual",
					primaryName: "Test Person",
					aliases: null,
					birthDate: null,
					birthPlace: null,
					addresses: null,
					identifiers: null,
					remarks: null,
					sourceList: "SDN",
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

		expect(screen.getByText(/high match/i)).toBeInTheDocument();
	});

	it("should expand and show details when clicked", () => {
		const mockMatches: OfacMatch[] = [
			{
				target: {
					id: "test-1",
					partyType: "Individual",
					primaryName: "Test Person",
					aliases: ["Alias 1", "Alias 2"],
					birthDate: "1980-01-01",
					birthPlace: "New York, USA",
					addresses: ["123 Test St, New York, NY"],
					identifiers: [
						{
							type: "Passport",
							number: "ABC123456",
							country: "US",
						},
					],
					remarks: "Test remarks",
					sourceList: "SDN",
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

		// Details should not be visible initially
		expect(screen.queryByText("1980-01-01")).not.toBeInTheDocument();

		// Click to expand
		const detailsButton = screen.getByText(/show details/i);
		fireEvent.click(detailsButton);

		// Details should now be visible
		expect(screen.getByText("1980-01-01")).toBeInTheDocument();
		expect(screen.getByText(/Passport: ABC123456/)).toBeInTheDocument();
	});

	it("should show aliases for OFAC and UNSC but not SAT 69-B", () => {
		const ofacMatch: OfacMatch = {
			target: {
				id: "test-ofac",
				partyType: "Individual",
				primaryName: "OFAC Person",
				aliases: ["Alias OFAC"],
				birthDate: null,
				birthPlace: null,
				addresses: null,
				identifiers: null,
				remarks: null,
				sourceList: "SDN",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			},
			score: 0.8,
			breakdown: {
				vectorScore: 0.8,
				nameScore: 0.8,
				metaScore: 0,
				identifierMatch: false,
			},
		};

		const sat69bMatch: Sat69bMatch = {
			target: {
				id: "test-sat",
				rfc: "XAXX010101000",
				taxpayerName: "SAT Company",
				taxpayerStatus: "Definitivo",
				presumptionPhase: null,
				rebuttalPhase: null,
				definitivePhase: null,
				favorablePhase: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			},
			score: 0.7,
			breakdown: {
				vectorScore: 0.7,
				nameScore: 0.7,
				metaScore: 0,
				identifierMatch: false,
			},
		};

		const { rerender } = renderWithProvider(
			<MatchResultsList matches={[ofacMatch]} />,
		);
		expect(screen.getByText(/Alias OFAC/)).toBeInTheDocument();

		rerender(
			<LanguageProvider>
				<MatchResultsList matches={[sat69bMatch]} />
			</LanguageProvider>,
		);
		// SAT 69-B shouldn't show aliases section
		expect(screen.queryByText(/aliases/i)).not.toBeInTheDocument();
	});

	it("should display score breakdown with correct percentages", () => {
		const mockMatches: UnscMatch[] = [
			{
				target: {
					id: "test-1",
					partyType: "Individual",
					primaryName: "Test Person",
					aliases: null,
					birthDate: null,
					birthPlace: null,
					gender: null,
					nationalities: null,
					addresses: null,
					identifiers: null,
					designations: null,
					remarks: null,
					unListType: "Taliban",
					referenceNumber: null,
					listedOn: null,
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

		// Check for score breakdown label
		expect(screen.getByText(/score breakdown/i)).toBeInTheDocument();

		// Check percentages (the actual values are what matter)
		expect(screen.getByText("90%")).toBeInTheDocument(); // nameScore
		expect(screen.getByText("80%")).toBeInTheDocument(); // vectorScore
		expect(screen.getByText("50%")).toBeInTheDocument(); // metaScore
	});
});
