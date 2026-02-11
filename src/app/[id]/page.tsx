"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { MatchResultsList } from "@/components/match-results-list";
import { Logo } from "@/components/logo";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	searchWatchlist,
	type WatchlistSearchRequest,
	type WatchlistMatch,
} from "@/lib/api/watchlist-search";
import { useJwt } from "@/hooks/useJwt";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";
import { ApiError } from "@/lib/api/http";

// Result interface for session storage
interface SearchResult {
	id: string;
	searchParams: WatchlistSearchRequest;
	timestamp: Date;
	matches: WatchlistMatch[];
	matchCount: number;
}

function ResultPage() {
	const params = useParams();
	const router = useRouter();
	const { t } = useLanguage();
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<SearchResult | null>(null);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

	const queryId = params?.id as string;

	useEffect(() => {
		setMounted(true);
	}, []);

	// Check watchlist product access
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

	useEffect(() => {
		if (!mounted || !queryId || jwtLoading) return;

		const performSearch = async () => {
			setLoading(true);
			setError(null);

			try {
				// Try to load from sessionStorage first
				const cachedResult = sessionStorage.getItem(`pep-result-${queryId}`);
				if (cachedResult) {
					const parsed = JSON.parse(cachedResult);
					setResult({
						...parsed,
						timestamp: new Date(parsed.timestamp),
					});
					setLoading(false);
					return;
				}

				// Check for pending search
				const pendingSearch = sessionStorage.getItem(`pep-pending-${queryId}`);
				if (!pendingSearch) {
					setError(t("searchNotFound"));
					setLoading(false);
					return;
				}

				const { searchParams } = JSON.parse(pendingSearch) as {
					searchParams: WatchlistSearchRequest;
				};

				// Perform the search using new API
				const response = await searchWatchlist(searchParams, {
					jwt: jwt || "",
				});

				const searchResult: SearchResult = {
					id: queryId,
					searchParams,
					timestamp: new Date(),
					matches: response.result.matches,
					matchCount: response.result.count,
				};

				setResult(searchResult);

				// Save to sessionStorage
				sessionStorage.setItem(
					`pep-result-${queryId}`,
					JSON.stringify(searchResult),
				);

				// Update recent searches
				try {
					const recentSearches = sessionStorage.getItem("pep-recent-searches");
					const searches: SearchResult[] = recentSearches
						? JSON.parse(recentSearches)
						: [];

					// Add to the top, keep only last 5
					const updated = [
						searchResult,
						...searches.filter((s) => s.id !== queryId),
					].slice(0, 5);

					sessionStorage.setItem(
						"pep-recent-searches",
						JSON.stringify(updated),
					);
				} catch (e) {
					console.log("[v0] Error updating recent searches:", e);
				}

				// Clean up pending search
				sessionStorage.removeItem(`pep-pending-${queryId}`);
			} catch (err) {
				console.error("[v0] Search error:", err);
				if (err instanceof ApiError) {
					setError(err.message);
				} else {
					setError(t("searchFailed"));
				}
			} finally {
				setLoading(false);
			}
		};

		performSearch();
	}, [mounted, queryId, jwt, jwtLoading, t]);

	const handleNewSearch = () => {
		router.push("/");
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

			<div className="flex-1 px-4 py-6 sm:py-8 max-w-4xl mx-auto w-full">
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="flex items-center gap-3">
							<Logo
								variant="icon"
								width={32}
								height={32}
								className="animate-pulse"
							/>
							<span className="text-muted-foreground">{t("searching")}</span>
						</div>
					</div>
				)}

				{error && (
					<div className="space-y-4">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
						<div className="flex justify-center">
							<Button onClick={handleNewSearch}>{t("newSearch")}</Button>
						</div>
					</div>
				)}

				{!loading && !error && result && (
					<div className="space-y-6">
						{/* Search Info */}
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold">
									{t("searchResultsFor")} &quot;{result.searchParams.q}&quot;
								</h1>
								{result.searchParams.identifiers &&
									result.searchParams.identifiers.length > 0 && (
										<p className="text-sm text-muted-foreground mt-1">
											{t("identifiersLabel")}:{" "}
											{result.searchParams.identifiers.join(", ")}
										</p>
									)}
							</div>
							<Button variant="outline" onClick={handleNewSearch}>
								{t("newSearch")}
							</Button>
						</div>

						{/* Results */}
						<MatchResultsList matches={result.matches} />
					</div>
				)}
			</div>
		</main>
	);
}

export default function Result() {
	return (
		<LanguageProvider>
			<ResultPage />
		</LanguageProvider>
	);
}
