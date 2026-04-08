import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScreeningResultsCard } from "@/components/screening-results-card";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import type { SearchQuery, QueryStatus } from "@/lib/api/queries";
import type { WatchlistFeatures } from "@/lib/api/watchlist-config";
import type { Language } from "@/lib/translations";
import type { ProgressMessages } from "@/hooks/useSearchQuery";

// ---------------------------------------------------------------------------
// Story args → SearchQuery / features
// ---------------------------------------------------------------------------

export interface PepSectionStoryArgs {
	pepSearch: boolean;
	pepGrok: boolean;
	adverseMedia: boolean;
	storyLanguage: Language;
	pepOfficialStatus: QueryStatus;
	pepOfficialHasMatches: boolean;
	pepAiStatus: QueryStatus;
	/** 0–1 probability for Grok PEP */
	pepAiProbability: number;
	pepAiShowSummary: boolean;
	pepAiShowSources: boolean;
	pepAiErrorMessage: string;
	progressPepGrok: string;
}

function buildSearchQuery(args: PepSectionStoryArgs): SearchQuery {
	const now = new Date().toISOString();
	const pepOfficialResult =
		args.pepOfficialHasMatches && args.pepOfficialStatus === "completed"
			? [
					{
						id: "pep-off-1",
						nombre: "Official PEP match (story)",
						informacionPrincipal: {
							institucion: "Story Ministry",
							cargo: "Example role",
							area: "Story",
						},
					},
				]
			: null;

	let pepAiResult: unknown = null;
	if (args.pepAiStatus === "failed") {
		pepAiResult = { error: args.pepAiErrorMessage || "PEP AI failed" };
	} else if (
		args.pepAiStatus === "completed" ||
		args.pepAiStatus === "running" ||
		args.pepAiStatus === "pending"
	) {
		pepAiResult = {
			probability: args.pepAiProbability,
			summary: args.pepAiShowSummary
				? {
						en: "Summary (EN): elevated public exposure in sample jurisdiction.",
						es: "Resumen (ES): exposición pública elevada en jurisdicción de ejemplo.",
					}
				: "",
			sources: args.pepAiShowSources
				? ["https://example.org/source-one", "Plain text source"]
				: [],
		};
	}

	return {
		id: "00000000-0000-4000-8000-000000000001",
		organizationId: "00000000-0000-4000-8000-000000000002",
		userId: null,
		source: "watchlist_query",
		userDisplay: null,
		query: "STORY SUBJECT",
		entityType: "individual",
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
		pepOfficialStatus: args.pepOfficialStatus,
		pepOfficialResult,
		pepOfficialCount: Array.isArray(pepOfficialResult)
			? pepOfficialResult.length
			: 0,
		pepAiStatus: args.pepAiStatus,
		pepAiResult,
		adverseMediaStatus: "completed",
		adverseMediaResult: { risk_level: "none" },
		createdAt: now,
		updatedAt: now,
	};
}

function LanguageSync({
	language,
	children,
}: {
	language: Language;
	children: React.ReactNode;
}) {
	const { language: current, setLanguage } = useLanguage();
	useEffect(() => {
		if (language !== current) setLanguage(language);
	}, [language, current, setLanguage]);
	return <>{children}</>;
}

function PepSectionStory(args: PepSectionStoryArgs) {
	const data = buildSearchQuery(args);
	const features: WatchlistFeatures = {
		pepSearch: args.pepSearch,
		pepGrok: args.pepGrok,
		adverseMedia: args.adverseMedia,
	};
	const progressMessages: ProgressMessages | undefined =
		args.progressPepGrok.trim().length > 0
			? {
					pepGrok: args.progressPepGrok,
					adverseMedia: null,
					pepOfficial: null,
				}
			: undefined;

	return (
		<LanguageSync language={args.storyLanguage}>
			<div className="max-w-3xl mx-auto p-4">
				<ScreeningResultsCard
					data={data}
					features={features}
					progressMessages={progressMessages}
				/>
			</div>
		</LanguageSync>
	);
}

const meta: Meta<PepSectionStoryArgs> = {
	title: "Components/ScreeningResultsCard",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Screening results accordion. The PEP story focuses on the merged PEP section (trigger, RiskSectionBadge, and PEP AI subsection).",
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<LanguageProvider>
					<Story />
				</LanguageProvider>
			</ThemeProvider>
		),
	],
};

export default meta;

type PepStory = StoryObj<PepSectionStoryArgs>;

export const PEP_Section: PepStory = {
	name: "PEP section (playground)",
	render: (args) => <PepSectionStory {...args} />,
	args: {
		pepSearch: true,
		pepGrok: true,
		adverseMedia: false,
		storyLanguage: "es",
		pepOfficialStatus: "completed",
		pepOfficialHasMatches: false,
		pepAiStatus: "completed",
		pepAiProbability: 0.55,
		pepAiShowSummary: true,
		pepAiShowSources: true,
		pepAiErrorMessage: "Upstream error",
		progressPepGrok: "",
	},
	argTypes: {
		storyLanguage: {
			control: "radio",
			options: ["es", "en"],
		},
		pepOfficialStatus: {
			control: "select",
			options: ["pending", "running", "completed", "failed", "skipped"],
		},
		pepAiStatus: {
			control: "select",
			options: ["pending", "running", "completed", "failed", "skipped"],
		},
		pepAiProbability: {
			control: { type: "range", min: 0, max: 1, step: 0.05 },
		},
	},
	play: async ({ canvasElement }) => {
		const user = userEvent.setup();
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: /PEP/i });
		await user.click(trigger);
	},
};
