"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchForm } from "@/components/search-form";
import { RecentSearches } from "@/components/recent-searches";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { SessionGuard } from "@/components/session-guard";
import { type PEPResult } from "@/lib/mock-data";

function HomeContent() {
	const router = useRouter();
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

	const handleSearch = (name: string) => {
		// Generate a query ID
		const queryId = crypto.randomUUID();

		// Store pending search in sessionStorage
		try {
			sessionStorage.setItem(
				`pep-pending-${queryId}`,
				JSON.stringify({ searchName: name }),
			);
		} catch (e) {
			console.log("[v0] Error saving pending search:", e);
		}

		// Redirect to the query page
		router.push(`/${queryId}`);
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
		<SessionGuard requireAuth={true}>
			<main className="min-h-screen bg-background flex flex-col">
				{/* Avatar only - Top right for search view */}
				<div className="fixed top-4 right-4 z-10">
					<UserMenu />
				</div>

				{/* Main Content */}
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
							<RecentSearches searches={recentSearches} />
						</div>
					</div>
				</div>
			</main>
		</SessionGuard>
	);
}

export default function Home() {
	return (
		<LanguageProvider>
			<HomeContent />
		</LanguageProvider>
	);
}
