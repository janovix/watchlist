import type { Meta, StoryObj } from "@storybook/react";
import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";
import { SearchForm } from "@/components/search-form";
import { LoadingView } from "@/components/loading-view";
import { ResultView } from "@/components/result-view";
import { RecentSearches } from "@/components/recent-searches";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { generateMockResult, type PEPResult } from "@/lib/mock-data";

const meta: Meta = {
	title: "Views/Full Page",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Complete application page view showing all states: search, loading, and result views. Includes the header with logo and navigation controls, and demonstrates the full user flow of the PEP verification application.",
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

type Story = StoryObj<typeof meta>;

type ViewState = "search" | "loading" | "result";

function FullPageContent() {
	const [viewState, setViewState] = useState<ViewState>("search");
	const [searchName, setSearchName] = useState("");
	const [currentResult, setCurrentResult] = useState<PEPResult | null>(null);
	const [recentSearches, setRecentSearches] = useState<PEPResult[]>([]);
	const [mounted, setMounted] = useState(false);
	const { t } = useLanguage();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		const loadMockSearches = async () => {
			const searches = await Promise.all([
				generateMockResult("Juan Pérez"),
				generateMockResult("María González"),
			]);
			setRecentSearches(searches);
		};
		loadMockSearches();
	}, [mounted]);

	const handleSearch = async (name: string) => {
		setSearchName(name);
		setViewState("loading");
		setTimeout(async () => {
			const result = await generateMockResult(name);
			setCurrentResult(result);
			setRecentSearches((prev) => {
				const filtered = prev.filter((s) => s.id !== result.id);
				return [result, ...filtered].slice(0, 10);
			});
			setViewState("result");
		}, 2000);
	};

	const handleNewSearch = () => {
		setSearchName("");
		setCurrentResult(null);
		setViewState("search");
	};

	const handleSelectSearch = (result: PEPResult) => {
		setCurrentResult(result);
		setViewState("result");
	};

	if (!mounted) {
		return (
			<main className="min-h-screen bg-background flex items-center justify-center">
				<div className="flex items-center gap-3">
					<Logo variant="icon" width={32} height={32} />
					<span className="text-muted-foreground">{t("loading")}</span>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background flex flex-col">
			{/* Header - Only shown for result view */}
			{viewState === "result" && (
				<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Logo variant="logo" width={102} height={16} />
							</div>
							<div className="flex items-center gap-2">
								<LanguageToggle />
								<ThemeToggle />
								<UserMenu />
							</div>
						</div>
					</div>
				</header>
			)}

			{/* Main Content */}
			{viewState === "search" ? (
				<div className="flex-1 flex items-center justify-center min-h-screen py-8 px-4">
					<div className="w-full max-w-2xl mx-auto flex flex-col items-center">
						{/* Logo */}
						<div className="mb-8">
							<Logo variant="logo" width={120} height={19} />
						</div>

						{/* Search Form */}
						<div className="w-full mb-6">
							<SearchForm onSearch={handleSearch} isLoading={false} />
						</div>

						{/* Language/Theme Toggle */}
						<div className="flex items-center gap-2 mb-8">
							<LanguageToggle />
							<ThemeToggle />
						</div>

						{/* Recent Searches */}
						{recentSearches.length > 0 && (
							<div className="w-full max-w-2xl overflow-y-auto max-h-[40vh]">
								<RecentSearches
									searches={recentSearches}
									onSelectSearch={handleSelectSearch}
								/>
							</div>
						)}
					</div>
				</div>
			) : viewState === "loading" ? (
				<div className="flex-1 flex items-center justify-center min-h-screen py-10 px-4">
					<div className="w-full max-w-2xl mx-auto">
						<LoadingView searchName={searchName} />
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center py-10">
					<div className="container mx-auto px-4 w-full">
						{currentResult && (
							<div className="py-4">
								<ResultView
									result={currentResult}
									onNewSearch={handleNewSearch}
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</main>
	);
}

export const SearchState: Story = {
	render: () => <FullPageContent />,
	parameters: {
		docs: {
			description: {
				story:
					"Full page in search state - the initial view when users first visit the application. Minimalist search engine design with centered logo, search bar, language/theme toggles, and recent searches. No header.",
			},
		},
	},
};

export const LoadingState: Story = {
	render: () => {
		return (
			<main className="min-h-screen bg-background flex flex-col">
				<div className="flex-1 flex items-center justify-center min-h-screen py-10 px-4">
					<div className="w-full max-w-2xl mx-auto">
						<LoadingView searchName="Juan Pérez García" />
					</div>
				</div>
			</main>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"Full page in loading state - displayed while a PEP search is being processed. No header, centered loading view with animated indicators.",
			},
		},
	},
};

export const ResultStatePEP: Story = {
	render: () => {
		const [currentResult, setCurrentResult] = useState<PEPResult | null>(null);
		const { t } = useLanguage();

		useEffect(() => {
			generateMockResult("Juan Carlos Pérez García").then((result) => {
				if (result.isPep) {
					setCurrentResult(result);
				} else {
					// Force a PEP result
					setCurrentResult({
						...result,
						isPep: true,
						record: {
							dataset: "OFAC",
							id: "OFAC-12345",
							name: "Juan Carlos Pérez García",
							aliases: ["J.C. Pérez", "Juan Pérez"],
							birthDate: "1965-03-15",
							countries: ["ES", "MX"],
							firstSeen: "2018-06-01T00:00:00Z",
							lastChange: "2023-11-15T14:30:00Z",
							lastSeen: "2024-01-10T08:00:00Z",
						},
					});
				}
			});
		}, []);

		if (!currentResult) {
			return <div>Loading...</div>;
		}

		return (
			<main className="min-h-screen bg-background flex flex-col">
				<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Logo variant="logo" width={102} height={16} />
							</div>
							<div className="flex items-center gap-2">
								<LanguageToggle />
								<ThemeToggle />
								<UserMenu />
							</div>
						</div>
					</div>
				</header>
				<div className="flex-1 flex items-center py-10">
					<div className="container mx-auto px-4 w-full">
						<div className="py-4">
							<ResultView result={currentResult} onNewSearch={() => {}} />
						</div>
					</div>
				</div>
			</main>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"Full page showing a PEP result - when the searched person is found in PEP lists. Displays header and detailed result view with record information.",
			},
		},
	},
};

export const ResultStateNotPEP: Story = {
	render: () => {
		const [currentResult, setCurrentResult] = useState<PEPResult | null>(null);

		useEffect(() => {
			generateMockResult("María González").then((result) => {
				if (!result.isPep) {
					setCurrentResult(result);
				} else {
					// Force a non-PEP result
					setCurrentResult({
						...result,
						isPep: false,
						record: null,
					});
				}
			});
		}, []);

		if (!currentResult) {
			return <div>Loading...</div>;
		}

		return (
			<main className="min-h-screen bg-background flex flex-col">
				<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Logo variant="logo" width={102} height={16} />
							</div>
							<div className="flex items-center gap-2">
								<LanguageToggle />
								<ThemeToggle />
								<UserMenu />
							</div>
						</div>
					</div>
				</header>
				<div className="flex-1 flex items-center py-10">
					<div className="container mx-auto px-4 w-full">
						<div className="py-4">
							<ResultView result={currentResult} onNewSearch={() => {}} />
						</div>
					</div>
				</div>
			</main>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"Full page showing a non-PEP result - when the searched person is not found in any PEP lists. Displays header and success result view.",
			},
		},
	},
};
