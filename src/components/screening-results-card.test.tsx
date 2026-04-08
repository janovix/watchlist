import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreeningResultsCard } from "./screening-results-card";
import type { SearchQuery } from "@/lib/api/queries";
import type { OfacMatch } from "@/lib/api/watchlist-search";
import type { ProgressMessages } from "@/hooks/useSearchQuery";

const matchBreakdown = {
	vectorScore: 0.5,
	nameScore: 0.5,
	metaScore: 0.5,
	identifierMatch: false,
};

function sampleOfacMatch(name: string, score: number): OfacMatch {
	return {
		score,
		breakdown: matchBreakdown,
		target: {
			id: "t1",
			partyType: "Individual",
			primaryName: name,
			aliases: null,
			birthDate: null,
			birthPlace: null,
			addresses: null,
			identifiers: null,
			remarks: null,
			sourceList: "SDN",
			createdAt: "",
			updatedAt: "",
		},
	};
}

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		language: "en" as const,
		t: (key: string) => key,
	}),
}));

const mockOpenExternal = vi.fn();

vi.mock("@/components/external-link-dialog", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/components/external-link-dialog")>();
	return {
		...actual,
		useExternalLinkRedirect: () => ({
			open: mockOpenExternal,
			href: null,
		}),
	};
});

vi.mock("@/components/match-results-list", () => ({
	MatchResultsList: ({ matches }: { matches: unknown[] }) => (
		<div data-testid="match-results-list">{matches?.length ?? 0} matches</div>
	),
}));

vi.mock("@/components/favicon", () => ({
	Favicon: () => <span data-testid="favicon" />,
}));

function baseQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
	return {
		id: "q1",
		organizationId: "o1",
		userId: "u1",
		source: "watchlist_query",
		userDisplay: null,
		query: "TEST ENTITY",
		entityType: "person",
		birthDate: null,
		countries: null,
		status: "completed",
		ofacStatus: "completed",
		ofacResult: { matches: [], count: 0 },
		ofacCount: 0,
		sat69bStatus: "completed",
		sat69bResult: { matches: [], count: 0 },
		sat69bCount: 0,
		unStatus: "completed",
		unResult: { matches: [], count: 0 },
		unCount: 0,
		pepOfficialStatus: "completed",
		pepOfficialResult: [],
		pepOfficialCount: 0,
		pepAiStatus: "completed",
		pepAiResult: { probability: 0, summary: "ok" },
		adverseMediaStatus: "completed",
		adverseMediaResult: { risk_level: "none", findings: "" },
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}

const emptyProgress: ProgressMessages = {
	pepGrok: null,
	adverseMedia: null,
	pepOfficial: null,
};

describe("ScreeningResultsCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders OFAC, UNSC, and SAT accordion sections", () => {
		render(
			<ScreeningResultsCard
				data={baseQuery()}
				progressMessages={emptyProgress}
				features={{
					pepSearch: true,
					pepGrok: true,
					adverseMedia: true,
				}}
			/>,
		);

		expect(screen.getByText("ofacSanctionsList")).toBeInTheDocument();
		expect(screen.getByText("unSanctionsList")).toBeInTheDocument();
		expect(screen.getByText("sat69bTitle")).toBeInTheDocument();
	});

	it("hides PEP block for organization entity type", () => {
		render(
			<ScreeningResultsCard
				data={baseQuery({ entityType: "organization" })}
				progressMessages={emptyProgress}
				features={{ pepSearch: true, pepGrok: true, adverseMedia: true }}
			/>,
		);

		expect(screen.queryByText("pepTitle")).not.toBeInTheDocument();
	});

	it("shows PEP section for person entity type", () => {
		render(
			<ScreeningResultsCard
				data={baseQuery({ entityType: "person" })}
				progressMessages={emptyProgress}
				features={{ pepSearch: true, pepGrok: true, adverseMedia: true }}
			/>,
		);

		expect(screen.getByText("pepTitle")).toBeInTheDocument();
	});

	it("shows verifying copy when OFAC is still running", async () => {
		const user = userEvent.setup();
		render(
			<ScreeningResultsCard
				data={baseQuery({
					ofacStatus: "running",
					ofacResult: { matches: [], count: 0 },
				})}
				progressMessages={emptyProgress}
				features={{ pepSearch: false, pepGrok: false, adverseMedia: false }}
			/>,
		);

		await user.click(screen.getByText("ofacSanctionsList"));
		expect(await screen.findByText("verifyingOfac")).toBeInTheDocument();
	});

	it("shows matches badge on OFAC when scored matches exist", () => {
		render(
			<ScreeningResultsCard
				data={baseQuery({
					ofacStatus: "completed",
					ofacCount: 1,
					ofacResult: {
						matches: [sampleOfacMatch("Sanctioned", 0.92)],
						count: 1,
					},
				})}
				progressMessages={emptyProgress}
				features={{ pepSearch: false, pepGrok: false, adverseMedia: false }}
			/>,
		);
		expect(screen.getByText("statusMatches")).toBeInTheDocument();
	});

	it("shows adverse media error when status failed", async () => {
		const user = userEvent.setup();
		render(
			<ScreeningResultsCard
				data={baseQuery({
					adverseMediaStatus: "failed",
					adverseMediaResult: { error: "service unavailable" },
				})}
				progressMessages={emptyProgress}
				features={{ pepSearch: false, pepGrok: false, adverseMedia: true }}
			/>,
		);
		await user.click(screen.getByText("adverseMediaTitle"));
		expect(screen.getByText("service unavailable")).toBeInTheDocument();
	});

	it("shows custom adverse media progress message when loading", async () => {
		const user = userEvent.setup();
		render(
			<ScreeningResultsCard
				data={baseQuery({
					adverseMediaStatus: "running",
					adverseMediaResult: null,
				})}
				progressMessages={{
					...emptyProgress,
					adverseMedia: "custom-progress",
				}}
				features={{ pepSearch: false, pepGrok: false, adverseMedia: true }}
			/>,
		);
		await user.click(screen.getByText("adverseMediaTitle"));
		expect(screen.getByText("custom-progress")).toBeInTheDocument();
	});

	it("shows adverse media risk badge when risk is high", async () => {
		const user = userEvent.setup();
		render(
			<ScreeningResultsCard
				data={baseQuery({
					adverseMediaStatus: "completed",
					adverseMediaResult: {
						risk_level: "high",
						findings: { es: "h", en: "f" },
						sources: ["https://news.example.com/a"],
					},
				})}
				progressMessages={emptyProgress}
				features={{ pepSearch: false, pepGrok: false, adverseMedia: true }}
			/>,
		);

		await user.click(screen.getByText("adverseMediaTitle"));
		expect(screen.getByText("riskLevelHigh")).toBeInTheDocument();
	});

	it("shows PEP AI error alert when Grok failed", async () => {
		const user = userEvent.setup();
		render(
			<ScreeningResultsCard
				data={baseQuery({
					pepAiStatus: "failed",
					pepAiResult: { error: "upstream error" },
				})}
				progressMessages={emptyProgress}
				features={{ pepSearch: false, pepGrok: true, adverseMedia: false }}
			/>,
		);

		await user.click(screen.getByText("pepTitle"));
		expect(screen.getByText("upstream error")).toBeInTheDocument();
	});

	it("shows MatchResultsList when OFAC has matches", async () => {
		const user = userEvent.setup();
		render(
			<ScreeningResultsCard
				data={baseQuery({
					ofacStatus: "completed",
					ofacCount: 1,
					ofacResult: {
						matches: [sampleOfacMatch("Match", 0.9)],
						count: 1,
					},
				})}
				progressMessages={emptyProgress}
				features={{ pepSearch: false, pepGrok: false, adverseMedia: false }}
			/>,
		);

		await user.click(screen.getByText("ofacSanctionsList"));
		expect(await screen.findByTestId("match-results-list")).toHaveTextContent(
			"1 matches",
		);
	});
});
