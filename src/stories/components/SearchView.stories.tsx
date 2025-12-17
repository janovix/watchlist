import type { Meta, StoryObj } from "@storybook/react";
import { SearchForm } from "@/components/search-form";
import { RecentSearches } from "@/components/recent-searches";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { generateMockResult, type PEPResult } from "@/lib/mock-data";
import { useState, useEffect } from "react";

const meta: Meta = {
	title: "Views/Search View",
	parameters: {
		layout: "fullscreen",
	},
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
			<div className="flex-1 flex items-center py-10">
				<div className="container mx-auto px-4 w-full">
					<div className="space-y-12">
						{/* Hero */}
						<div className="text-center space-y-4 max-w-2xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
								Verificación PEP
							</h2>
							<p className="text-muted-foreground text-lg">
								Verifica si una persona está en listas de Personas Expuestas
								Políticamente
							</p>
						</div>

						{/* Search Form */}
						<SearchForm onSearch={handleSearch} isLoading={false} />

						{/* Recent Searches */}
						{recentSearches.length > 0 && (
							<div className="max-w-2xl mx-auto">
								<RecentSearches
									searches={recentSearches}
									onSelectSearch={handleSelectSearch}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}

export const Default: Story = {
	render: () => <SearchViewContent />,
};

export const WithRecentSearches: Story = {
	render: () => <SearchViewContent />,
};

export const EmptyState: Story = {
	render: () => (
		<main className="min-h-screen bg-background flex flex-col">
			<div className="flex-1 flex items-center py-10">
				<div className="container mx-auto px-4 w-full">
					<div className="space-y-12">
						<div className="text-center space-y-4 max-w-2xl mx-auto">
							<h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
								Verificación PEP
							</h2>
							<p className="text-muted-foreground text-lg">
								Verifica si una persona está en listas de Personas Expuestas
								Políticamente
							</p>
						</div>
						<SearchForm onSearch={() => {}} isLoading={false} />
					</div>
				</div>
			</div>
		</main>
	),
};
