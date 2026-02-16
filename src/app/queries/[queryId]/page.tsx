"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/header";
import { MatchResultsList } from "@/components/match-results-list";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getQuery, type SearchQuery } from "@/lib/api/queries";
import { useJwt } from "@/hooks/useJwt";
import { useLanguage } from "@/components/language-provider";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";
import { ApiError } from "@/lib/api/http";
import { usePepSearch, type PepRawResult } from "@/hooks/usePepSearch";

export default function QueryDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { t } = useLanguage();
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState<SearchQuery | null>(null);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

	const queryId = params?.queryId as string;

	// PEP search via SSE (if pepSearchId exists)
	const pepSearchId = query?.pepOfficialResult
		? `pep_search:${query.query}` // Simplified - actual implementation would extract from result
		: null;
	const {
		results: pepResults,
		error: pepError,
		isLoading: pepLoading,
	} = usePepSearch(pepSearchId, !!pepSearchId);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !queryId || jwtLoading) return;

		const fetchQuery = async () => {
			setLoading(true);
			setError(null);

			try {
				// Try to fetch from API
				const response = await getQuery(queryId, { jwt: jwt || "" });
				setQuery(response.result);
			} catch (err) {
				console.error("[QueryDetail] Fetch error:", err);
				if (err instanceof ApiError) {
					setError(err.message);
				} else {
					setError(t("searchFailed") || "Failed to load query");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchQuery();
	}, [mounted, queryId, jwt, jwtLoading, t]);

	const handleNewSearch = () => {
		router.push("/");
	};

	const handleBack = () => {
		router.push("/queries");
	};

	// Check watchlist product access
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

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
		<main className="min-h-screen flex flex-col pt-20">
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
						<div className="flex justify-center gap-4">
							<Button onClick={handleBack} variant="outline">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Queries
							</Button>
							<Button onClick={handleNewSearch}>{t("newSearch")}</Button>
						</div>
					</div>
				)}

				{!loading && !error && query && (
					<div className="space-y-6">
						{/* Header */}
						<div className="flex items-center justify-between">
							<div>
								<Button
									onClick={handleBack}
									variant="ghost"
									className="mb-4 -ml-2"
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Queries
								</Button>
								<h1 className="text-2xl font-bold">
									{t("searchResultsFor") || "Search Results for"} &quot;
									{query.query}&quot;
								</h1>
								{query.birthDate && (
									<p className="text-sm text-muted-foreground mt-1">
										Birth Date: {query.birthDate}
									</p>
								)}
							</div>
							<Button variant="outline" onClick={handleNewSearch}>
								{t("newSearch")}
							</Button>
						</div>

						{/* OFAC Results */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">
								OFAC Results ({query.ofacCount || 0})
							</h2>
							{query.ofacResult && query.ofacResult.matches.length > 0 ? (
								<MatchResultsList matches={query.ofacResult.matches} />
							) : (
								<p className="text-muted-foreground py-4">
									{t("noOfacResults") || "No OFAC matches found"}
								</p>
							)}
						</section>

						{/* SAT 69-B Results */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">
								SAT 69-B Results ({query.sat69bCount || 0})
							</h2>
							{query.sat69bResult && query.sat69bResult.matches.length > 0 ? (
								<MatchResultsList matches={query.sat69bResult.matches} />
							) : (
								<p className="text-muted-foreground py-4">
									{t("noSat69bResults") || "No SAT 69-B matches found"}
								</p>
							)}
						</section>

						{/* UNSC Results */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">
								UNSC Results ({query.unCount || 0})
							</h2>
							{query.unResult && query.unResult.matches.length > 0 ? (
								<MatchResultsList matches={query.unResult.matches} />
							) : (
								<p className="text-muted-foreground py-4">
									{t("noUnscResults") || "No UNSC matches found"}
								</p>
							)}
						</section>

						{/* PEP Results Section */}
						{query.pepOfficialStatus && (
							<div className="border-t pt-6">
								<h2 className="text-xl font-semibold mb-4">
									{t("pepResultsTitle") || "PEP Results"}
								</h2>

								{/* Loading state */}
								{pepLoading && !pepResults && (
									<div className="flex items-center gap-3 py-8">
										<Loader2 className="h-5 w-5 animate-spin text-primary" />
										<span className="text-muted-foreground">
											{t("pepSearching") || "Searching PEP database..."}
										</span>
									</div>
								)}

								{/* Error state */}
								{pepError && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>
											{t("pepError") || "PEP search error:"} {pepError}
										</AlertDescription>
									</Alert>
								)}

								{/* Results */}
								{pepResults && pepResults.length > 0 && (
									<div className="space-y-4">
										<p className="text-sm text-muted-foreground">
											Found {pepResults.length} PEP results
										</p>
										<div className="grid gap-4">
											{pepResults.map((pepResult) => (
												<div
													key={pepResult.id}
													className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
												>
													<h3 className="font-semibold text-lg mb-2">
														{pepResult.nombre}
													</h3>
													<div className="grid gap-2 text-sm">
														{pepResult.informacionPrincipal?.institucion && (
															<p>
																<span className="font-medium">
																	Institución:
																</span>{" "}
																{pepResult.informacionPrincipal.institucion}
															</p>
														)}
														{pepResult.informacionPrincipal?.cargo && (
															<p>
																<span className="font-medium">Cargo:</span>{" "}
																{pepResult.informacionPrincipal.cargo}
															</p>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* No results */}
								{!pepLoading &&
									!pepError &&
									pepResults &&
									pepResults.length === 0 && (
										<p className="text-muted-foreground py-4">
											No PEP matches found
										</p>
									)}
							</div>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
