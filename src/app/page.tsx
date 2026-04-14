"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CalendarDays, Settings2 } from "lucide-react";
import { CountryMultiSelect } from "@/components/country-multi-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TypeSwitch } from "@/components/type-switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import { RecentSearches } from "@/components/recent-searches";
import {
	searchWatchlist,
	type WatchlistSearchRequest,
} from "@/lib/api/watchlist-search";
import { listQueries } from "@/lib/api/queries";
import { useJwt } from "@/hooks/useJwt";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { LAYOUT_HORIZONTAL_PAD, LAYOUT_NARROW } from "@/lib/layout";
import { cn } from "@/lib/utils";

const RECENT_SKELETON_ROWS = 5;

/** Route-level skeleton: pill search bar + recent searches block (matches loaded layout). */
export function HomePageSkeleton() {
	return (
		<div className={cn("flex flex-1 flex-col", LAYOUT_HORIZONTAL_PAD)}>
			<div className="flex min-h-0 flex-1 flex-col items-center justify-center">
				<div
					className={cn(
						"flex w-full flex-col gap-6 max-sm:pt-8",
						LAYOUT_NARROW,
					)}
				>
					<div className="flex flex-col items-center gap-3 text-center">
						<Skeleton className="h-9 w-48 max-w-full rounded-md" />
						<div className="flex w-full max-w-md flex-col gap-2">
							<Skeleton className="mx-auto h-4 w-full rounded-md" />
							<Skeleton className="mx-auto h-4 w-[80%] max-w-sm rounded-md" />
						</div>
					</div>
					<div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:py-2.5">
						<Skeleton className="h-10 w-full rounded-md sm:order-2 sm:flex-1 sm:min-w-0" />
						<div className="flex w-full items-center justify-between gap-2 sm:contents">
							<Skeleton className="h-10 w-[88px] shrink-0 rounded-full sm:order-1" />
							<div className="flex shrink-0 items-center gap-1.5 sm:order-3">
								<Skeleton className="h-9 w-9 rounded-full" />
								<Skeleton className="h-9 w-9 rounded-full" />
							</div>
						</div>
					</div>
					<div className="overflow-hidden rounded-xl border border-border min-w-0">
						<div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-4 sm:px-6">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-8 w-28 rounded-md" />
						</div>
						<div className="flex flex-col bg-card">
							{[...Array(RECENT_SKELETON_ROWS)].map((_, i) => (
								<div
									key={i}
									className="flex flex-col gap-2 border-b border-border/50 px-4 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-6"
								>
									<div className="flex items-center gap-3">
										<Skeleton className="h-3.5 w-3.5 rounded-sm" />
										<Skeleton className="h-4 w-48 max-w-full" />
									</div>
									<Skeleton className="h-3.5 w-32 max-sm:self-start" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

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
	const [isLoadingRecentSearches, setIsLoadingRecentSearches] = useState(true);
	const { jwt, isLoading: jwtLoading } = useJwt();

	useOnboardingTour(!jwtLoading);

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

	const handleSearch = async (searchQuery?: string) => {
		const queryToSearch = searchQuery || query;
		if (!queryToSearch.trim() || isSearching) return;

		setIsSearching(true);

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
		<main className={cn("flex flex-1 flex-col", LAYOUT_HORIZONTAL_PAD)}>
			<div className="flex min-h-0 flex-1 flex-col items-center justify-center">
				<div
					className={cn(
						"flex w-full flex-col gap-6 max-sm:pt-8 mb-6",
						LAYOUT_NARROW,
					)}
				>
					<div className="flex flex-col items-center gap-3 text-center">
						<h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
							{t("homeTitle")}
						</h1>
						<p className="text-pretty text-sm text-muted-foreground sm:text-base">
							{t("homeSubtitle")}
						</p>
					</div>

					{/* Search bar: stacked on narrow mobile (full-width input), single-row pill from sm */}
					<div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all duration-300 hover:border-muted-foreground/30 sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:py-2.5">
						<Input
							id="search-input"
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
							className="order-1 w-full min-w-0 border-0 bg-transparent p-0 px-2 text-base uppercase shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:order-2 sm:flex-1"
						/>

						<div className="order-2 flex w-full items-center justify-between gap-2 sm:contents">
							<div id="entity-type-switch" className="shrink-0 sm:order-1">
								<TypeSwitch
									compact
									checked={searchType === "company"}
									onCheckedChange={(checked) =>
										setSearchType(checked ? "company" : "individual")
									}
								/>
							</div>

							<div className="flex shrink-0 items-center gap-1.5 sm:order-3">
								<Button
									id="advanced-settings-btn"
									onClick={() => setAdvancedOpen(!advancedOpen)}
									variant="ghost"
									size="icon"
									className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0 transition-colors ${advancedOpen ? "bg-primary/15 text-primary" : ""}`}
								>
									<Settings2 className="h-4 w-4" />
								</Button>
								<Button
									id="submit-search-btn"
									onClick={() => handleSearch()}
									disabled={!canSubmit}
									loading={isSearching}
									size="icon"
									className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-0"
								>
									{!isSearching && <ChevronRight className="h-4 w-4" />}
								</Button>
							</div>
						</div>
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
					<RecentSearches
						searches={recentSearches}
						isLoading={isLoadingRecentSearches}
						onSelect={(search) => {
							router.push(`/queries/${search.id}`);
						}}
						onFocusSearch={() => {}}
					/>
				</div>
			</div>

			<Footer />
		</main>
	);
}
