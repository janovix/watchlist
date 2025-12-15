"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { SearchForm } from "@/components/search-form";
import { LoadingView } from "@/components/loading-view";
import { ResultView } from "@/components/result-view";
import { RecentSearches } from "@/components/recent-searches";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";
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
					<Shield className="h-8 w-8 text-primary animate-pulse" />
					<span className="text-muted-foreground">{t("loading")}</span>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							<div className="flex flex-col">
								<h1 className="text-lg font-semibold text-foreground font-mono">
									<span className="text-primary">is</span>
									<span>Pep</span>
								</h1>
								<span className="text-xs text-muted-foreground">
									{t("byJanovix")}
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<LanguageToggle />
							<ThemeToggle />
							<UserMenu />
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="flex-1 flex items-center py-10">
				<div className="container mx-auto px-4 w-full">
					{viewState === "search" && (
						<div className="space-y-12">
							{/* Hero */}
							<div className="text-center space-y-4 max-w-2xl mx-auto">
								<h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
									{t("heroTitle")}
								</h2>
								<p className="text-muted-foreground text-lg">
									{t("heroDescription")}
								</p>
							</div>

							{/* Search Form */}
							<SearchForm onSearch={handleSearch} isLoading={false} />

							{/* Recent Searches */}
							<div className="max-w-2xl mx-auto">
								<RecentSearches
									searches={recentSearches}
									onSelectSearch={handleSelectSearch}
								/>
							</div>

							<div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
								{[
									{
										label: t("isPep"),
										desc: t("yes"),
										color: "text-destructive",
										bg: "bg-destructive/10",
									},
									{
										label: t("isNotPep"),
										desc: t("no"),
										color: "text-green-600 dark:text-green-400",
										bg: "bg-green-500/10",
									},
								].map((item) => null)}
							</div>
						</div>
					)}

					{viewState === "loading" && (
						<div className="py-12">
							<LoadingView searchName={searchName} />
						</div>
					)}

					{viewState === "result" && currentResult && (
						<div className="py-4">
							<ResultView
								result={currentResult}
								onNewSearch={handleNewSearch}
							/>
						</div>
					)}
				</div>
			</div>
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
