"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CalendarDays, Settings2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { CountryMultiSelect } from "@/components/country-multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TypeSwitch } from "@/components/type-switch";
import { Label } from "@/components/ui/label";
import { getPrivacyUrl, getTermsUrl } from "@/lib/config-urls";
import { useLanguage } from "@/components/language-provider";
import { RecentSearches } from "@/components/recent-searches";
import {
	searchWatchlist,
	type WatchlistSearchRequest,
} from "@/lib/api/watchlist-search";
import { listQueries } from "@/lib/api/queries";
import { useJwt } from "@/hooks/useJwt";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";

export default function HomePage() {
	const router = useRouter();
	const { t } = useLanguage();
	const [searchType, setSearchType] = useState<"individual" | "company">(
		"individual",
	);
	const [query, setQuery] = useState("");
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [birthDate, setBirthDate] = useState("");
	const [identifiers, setIdentifiers] = useState("");
	const [countries, setCountries] = useState<string[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [recentSearches, setRecentSearches] = useState<
		{
			id: string;
			name: string;
			entityType: "person" | "organization";
			date: string;
		}[]
	>([]);
	const [showRecent, setShowRecent] = useState(true);
	const [isLoadingRecentSearches, setIsLoadingRecentSearches] = useState(true);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

	// Fetch recent searches on mount
	useEffect(() => {
		if (!jwt) return;
		const fetchRecent = async () => {
			setIsLoadingRecentSearches(true);
			try {
				const response = await listQueries({}, { jwt });
				const recent = response.queries
					.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)
					.slice(0, 5)
					.map((q) => ({
						id: q.id,
						name: q.query,
						entityType: q.entityType as "person" | "organization",
						date: new Date(q.createdAt).toLocaleString(),
					}));
				setRecentSearches(recent);
			} catch (error) {
				console.error("Error fetching recent searches:", error);
			} finally {
				setIsLoadingRecentSearches(false);
			}
		};
		fetchRecent();
	}, [jwt]);

	// Check watchlist product access
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

	const handleSearch = async (searchQuery?: string) => {
		const queryToSearch = searchQuery || query;
		if (!queryToSearch.trim() || isSearching) return;

		setIsSearching(true);
		setShowRecent(false);

		try {
			const entityType =
				searchType === "individual" ? "person" : "organization";

			const searchParams: WatchlistSearchRequest = {
				q: queryToSearch.trim(),
				entityType,
				threshold: 0.875,
			};

			if (birthDate.trim()) {
				searchParams.birthDate = birthDate.trim();
			}

			if (identifiers.trim()) {
				searchParams.identifiers = identifiers
					.split(",")
					.map((id) => id.trim())
					.filter((id) => id.length > 0);
			}

			if (countries.length > 0) {
				searchParams.countries = countries;
			}

			const response = await searchWatchlist(searchParams, {
				jwt: jwt || "",
			});

			const queryId = response.result.queryId;

			sessionStorage.setItem(
				`watchlist-pending-${queryId}`,
				JSON.stringify({ searchParams }),
			);
			sessionStorage.setItem(
				`watchlist-result-${queryId}`,
				JSON.stringify(response),
			);

			router.push(`/queries/${queryId}`);
		} catch (error) {
			console.error("Search error:", error);
			setIsSearching(false);
		}
	};

	const canSubmit = query.trim().length > 3 && !isSearching && !jwtLoading;

	return (
		<main className="flex-1 flex flex-col px-4 sm:px-6">
			<div className="flex-1 flex flex-col items-center justify-center min-h-0">
				<div className="w-full max-w-3xl flex flex-col gap-6">
					{/* Search bar - pill shaped */}
					<div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 transition-all duration-300 hover:border-muted-foreground/30">
						{/* Entity Type Toggle */}
						<TypeSwitch
							compact
							checked={searchType === "company"}
							onCheckedChange={(checked) =>
								setSearchType(checked ? "company" : "individual")
							}
						/>

						<Input
							value={query}
							autoFocus
							onChange={(e) => setQuery(e.target.value.toUpperCase())}
							onKeyDown={(e) =>
								e.key === "Enter" && canSubmit && handleSearch()
							}
							placeholder={
								searchType === "individual"
									? t("searchIndividualPlaceholder")
									: t("searchCompanyPlaceholder")
							}
							className="flex-1 border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0 uppercase font-mono min-w-0 px-2 bg-transparent p-0 shadow-none"
						/>

						{/* Advanced Search Toggle */}
						<Button
							onClick={() => setAdvancedOpen(!advancedOpen)}
							variant="ghost"
							size="icon"
							className={`shrink-0 rounded-full h-9 w-9 p-0 flex items-center justify-center transition-colors ${advancedOpen ? "bg-primary/15 text-primary" : ""}`}
						>
							<Settings2 className="h-4 w-4" />
						</Button>

						{/* Submit Button */}
						<Button
							onClick={() => handleSearch()}
							disabled={!canSubmit}
							size="icon"
							className="shrink-0 rounded-full h-9 w-9 p-0 flex items-center justify-center"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>

					{/* Advanced Settings - animated expand/collapse */}
					<div
						className="grid transition-[grid-template-rows] duration-300 ease-in-out"
						style={{ gridTemplateRows: advancedOpen ? "1fr" : "0fr" }}
					>
						<div className="overflow-hidden">
							<div
								className="transition-opacity duration-300 ease-in-out"
								style={{ opacity: advancedOpen ? 1 : 0 }}
							>
								<div className="rounded-xl border border-dashed border-border bg-card p-5 flex flex-col gap-5">
									{/* Identifiers */}
									<div className="flex flex-col gap-2">
										<Label className="text-sm font-medium">
											{t("identifiersLabel")}
										</Label>
										<Input
											value={identifiers}
											onChange={(e) => setIdentifiers(e.target.value)}
											placeholder={t("identifiersPlaceholder")}
											className="bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-ring"
										/>
									</div>

									{/* Countries */}
									<CountryMultiSelect
										value={countries}
										onChange={setCountries}
										label={t("countriesLabel")}
										placeholder={t("countriesPlaceholderSelect")}
									/>

									{/* Birth Date / Date of Creation */}
									<div className="flex flex-col gap-2">
										<Label className="text-sm font-medium">
											{searchType === "individual"
												? t("birthDateLabel")
												: t("dateOfCreationLabel")}
										</Label>
										<div className="relative">
											<Input
												type="date"
												value={birthDate}
												onChange={(e) => setBirthDate(e.target.value)}
												placeholder="YYYY-MM-DD"
												className="bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-ring [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
											/>
											<button
												type="button"
												onClick={(e) => {
													const input = (e.currentTarget as HTMLElement)
														.previousElementSibling as HTMLInputElement;
													input?.showPicker?.();
												}}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
												aria-label={t("openCalendar")}
											>
												<CalendarDays className="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* Recent Searches */}
					{showRecent && (
						<RecentSearches
							searches={recentSearches}
							isLoading={isLoadingRecentSearches}
							onSelect={(search) => {
								router.push(`/queries/${search.id}`);
							}}
							onFocusSearch={() => {}}
						/>
					)}
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full mt-auto py-4 border-t border-border/50 bg-background">
				<div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-sm text-muted-foreground px-4 sm:px-6">
					<div className="flex items-center gap-2 opacity-80">
						<Logo variant="logo" width={80} height={14} />
					</div>
					<div className="flex items-center gap-4">
						<span>&copy; {new Date().getFullYear()} Janovix</span>
						<a
							href={getPrivacyUrl()}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							{t("privacy")}
						</a>
						<a
							href={getTermsUrl()}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							{t("terms")}
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
}
