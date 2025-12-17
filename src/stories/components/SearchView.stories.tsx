import type { Meta, StoryObj } from "@storybook/react";
import { SearchForm } from "@/components/search-form";
import { RecentSearches } from "@/components/recent-searches";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { generateMockResult, type PEPResult } from "@/lib/mock-data";
import { useState, useEffect } from "react";

const meta: Meta = {
	title: "Views/Search View",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The main search view of the application. Minimalist search engine design with header containing logo and language/theme toggles, centered Watchlist title, search bar, and recent searches. Clean and focused on search.",
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

function SearchViewContent() {
	const [recentSearches, setRecentSearches] = useState<PEPResult[]>([]);

	useEffect(() => {
		// Generate some mock recent searches
		const loadMockSearches = async () => {
			const searches = await Promise.all([
				generateMockResult("Juan Pérez"),
				generateMockResult("María González"),
				generateMockResult("Carlos Mendoza"),
			]);
			setRecentSearches(searches);
		};
		loadMockSearches();
	}, []);

	const handleSearch = (name: string) => {
		console.log("Searching for:", name);
	};

	const handleSelectSearch = (result: PEPResult) => {
		console.log("Selected search:", result);
	};

	return (
		<main className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Logo variant="logo" width={102} height={16} />
						</div>
						<div className="flex items-center gap-2">
							<LanguageToggle />
							<ThemeToggle />
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 flex items-center justify-center min-h-screen py-8 px-4">
				<div className="w-full max-w-2xl mx-auto flex flex-col items-center">
					{/* Logo with Title */}
					<div className="mb-8 flex items-center gap-2">
						<Logo variant="logo" width={120} height={19} />
						<span className="h-1 w-1 rounded-full bg-muted-foreground" />
						<h1 className="text-xl font-semibold text-foreground">Watchlist</h1>
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
		</main>
	);
}

export const Default: Story = {
	render: () => <SearchViewContent />,
	parameters: {
		docs: {
			description: {
				story:
					"Search view with recent searches displayed. Shows header with logo and language/theme toggles, centered Watchlist title, search bar, and recent searches. Users can start a new search or select from recent searches.",
			},
		},
	},
};

export const WithRecentSearches: Story = {
	render: () => <SearchViewContent />,
	parameters: {
		docs: {
			description: {
				story:
					"Search view showing multiple recent searches. Demonstrates how the recent searches component appears when there are previous searches. Includes header with logo and language/theme toggles.",
			},
		},
	},
};

export const EmptyState: Story = {
	render: () => (
		<main className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Logo variant="logo" width={102} height={16} />
						</div>
						<div className="flex items-center gap-2">
							<LanguageToggle />
							<ThemeToggle />
						</div>
					</div>
				</div>
			</header>

			<div className="flex-1 flex items-center justify-center min-h-screen py-8 px-4">
				<div className="w-full max-w-2xl mx-auto flex flex-col items-center">
					{/* Logo with Title */}
					<div className="mb-8 flex items-center gap-2">
						<Logo variant="logo" width={120} height={19} />
						<span className="h-1 w-1 rounded-full bg-muted-foreground" />
						<h1 className="text-xl font-semibold text-foreground">Watchlist</h1>
					</div>

					{/* Search Form */}
					<div className="w-full mb-6">
						<SearchForm onSearch={() => {}} isLoading={false} />
					</div>

					{/* Language/Theme Toggle */}
					<div className="flex items-center gap-2">
						<LanguageToggle />
						<ThemeToggle />
					</div>
				</div>
			</div>
		</main>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Search view in empty state when there are no recent searches. Shows header with logo and language/theme toggles, centered Watchlist title, and search form.",
			},
		},
	},
};
