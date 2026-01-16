"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { SearchForm } from "@/components/search-form";
import { RecentSearches } from "@/components/recent-searches";
import { Logo } from "@/components/logo";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { type PEPResult } from "@/lib/mock-data";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";

function HomeContent() {
	const router = useRouter();
	const [recentSearches, setRecentSearches] = useState<PEPResult[]>([]);
	const [mounted, setMounted] = useState(false);
	const { t } = useLanguage();
	const subscription = useSubscriptionSafe();

	useEffect(() => {
		setMounted(true);
	}, []);

	// Check watchlist product access
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	// If subscription is loaded but user doesn't have watchlist access, show blocker
	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

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

	const handleStartSearch = () => {
		// Focus the search input on the page
		const searchInput = document.getElementById(
			"pep-search-input",
		) as HTMLInputElement;
		if (searchInput) {
			searchInput.focus();
		}
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
			<Header />

			{/* Main Content */}
			<div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-57px)] sm:min-h-[calc(100vh-65px)] py-6 sm:py-8 px-4">
				<div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 sm:gap-8">
					{/* Search Input - Centered */}
					<div className="w-full">
						<SearchForm onSearch={handleSearch} isLoading={false} />
					</div>

					{/* Recent Searches - Centered with scroll support */}
					<div className="w-full overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
						<RecentSearches
							searches={recentSearches}
							onStartSearch={handleStartSearch}
						/>
					</div>
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
