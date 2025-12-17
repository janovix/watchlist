"use client";

import { useState, useEffect } from "react";
import { SearchForm } from "@/components/search-form";
import { LoadingView } from "@/components/loading-view";
import { ResultView } from "@/components/result-view";
import { RecentSearches } from "@/components/recent-searches";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { type PEPResult, generateMockResult } from "@/lib/mock-data";

type ViewState = "search" | "loading" | "result";

function HomeContent() {
	const [viewState, setViewState] = useState<ViewState>("search");
	const [searchName, setSearchName] = useState("");
	const [currentResult, setCurrentResult] = useState<PEPResult | null>(null);
	const [recentSearches, setRecentSearches] = useState<PEPResult[]>([]);
	const [mounted, setMounted] = useState(false);
	const { t } = useLanguage();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Cargar búsquedas recientes del sessionStorage
	useEffect(() => {
		if (!mounted) return;
		try {
			const stored = sessionStorage.getItem("pep-recent-searches");
			if (stored) {
				const parsed = JSON.parse(stored);
				const restored = parsed.map((s: PEPResult) => ({
					...s,
					timestamp: new Date(s.timestamp),
				}));
				setRecentSearches(restored);
			}
		} catch (e) {
			console.log("[v0] Error loading recent searches:", e);
		}
	}, [mounted]);

	// Guardar búsquedas recientes en sessionStorage
	useEffect(() => {
		if (!mounted || recentSearches.length === 0) return;
		try {
			sessionStorage.setItem(
				"pep-recent-searches",
				JSON.stringify(recentSearches),
			);
		} catch (e) {
			console.log("[v0] Error saving recent searches:", e);
		}
	}, [recentSearches, mounted]);

	const handleSearch = async (name: string) => {
		setSearchName(name);
		setViewState("loading");

		try {
			const result = await generateMockResult(name);
			setCurrentResult(result);
			setRecentSearches((prev) => {
				const filtered = prev.filter((s) => s.id !== result.id);
				return [result, ...filtered].slice(0, 10);
			});
			setViewState("result");
		} catch (e) {
			console.log("[v0] Error in search:", e);
			setViewState("search");
		}
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
			{/* Header - Shown for both search and result views */}
			{(viewState === "search" || viewState === "result") && (
				<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
					<div className="container mx-auto px-4 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Logo variant="logo" width={102} height={16} />
							</div>
							<div className="flex items-center gap-2">
								<LanguageToggle />
								<ThemeToggle />
								{viewState === "result" && <UserMenu />}
							</div>
						</div>
					</div>
				</header>
			)}

			{/* Main Content */}
			{viewState === "search" ? (
				<div className="flex-1 flex items-center justify-center min-h-screen py-8 px-4">
					<div className="w-full max-w-2xl mx-auto flex flex-col items-center">
						{/* Logo with Title */}
						<div className="mb-8 flex items-center gap-2">
							<Logo variant="logo" width={120} height={19} />
							<span className="h-1 w-1 rounded-full bg-muted-foreground" />
							<h1 className="text-xl font-semibold text-foreground">
								Watchlist
							</h1>
						</div>

						{/* Search Form */}
						<div className="w-full mb-6">
							<SearchForm onSearch={handleSearch} isLoading={false} />
						</div>

						{/* Language/Theme Toggle - Right aligned but centered */}
						<div className="flex items-center gap-2 mb-8">
							<LanguageToggle />
							<ThemeToggle />
						</div>

						{/* Recent Searches - Centered with scroll support */}
						<div className="w-full max-w-2xl overflow-y-auto max-h-[40vh]">
							<RecentSearches
								searches={recentSearches}
								onSelectSearch={handleSelectSearch}
							/>
						</div>
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

export default function Home() {
	return (
		<LanguageProvider>
			<HomeContent />
		</LanguageProvider>
	);
}
