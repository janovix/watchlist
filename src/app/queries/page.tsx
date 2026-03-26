"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import debounce from "lodash.debounce";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Search,
	Clock,
	User,
	Building2,
	ChevronLeft,
	ChevronRight,
	Download,
	Loader2,
	Plus,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { listQueries, getQuery, type QueryListItem } from "@/lib/api/queries";
import { getPrivacyUrl, getTermsUrl } from "@/lib/config-urls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useJwt } from "@/hooks/useJwt";
import { useLanguage } from "@/components/language-provider";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import { generateScreeningPdf } from "@/lib/pdf/generate-screening-pdf";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const LIMIT = 20;
/** Delay (ms) before pushing search term to URL to avoid race with rapid typing */
const SEARCH_DEBOUNCE_MS = 300;

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	if (parts[0]?.length >= 2) {
		return parts[0].slice(0, 2).toUpperCase();
	}
	return parts[0]?.[0]?.toUpperCase() ?? "?";
}
const VALID_FILTERS = ["all", "person", "organization"] as const;

/**
 * Sanitize and validate search params
 */
function sanitizeSearchParams(
	search: string,
	filter: string,
	offset: string,
): {
	search: string;
	filter: "all" | "person" | "organization";
	offset: number;
} {
	// Sanitize search term (max 100 chars, basic alphanumeric + spaces)
	const sanitizedSearch = (search || "").slice(0, 100).trim();

	// Validate filter
	const sanitizedFilter = VALID_FILTERS.includes(filter as any)
		? (filter as "all" | "person" | "organization")
		: "all";

	// Validate offset (must be non-negative integer)
	const parsedOffset = parseInt(offset || "0", 10);
	const sanitizedOffset = Math.max(0, isNaN(parsedOffset) ? 0 : parsedOffset);

	return {
		search: sanitizedSearch,
		filter: sanitizedFilter,
		offset: sanitizedOffset,
	};
}

export default function QueriesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { language, t } = useLanguage();
	const [queries, setQueries] = useState<QueryListItem[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [localSearch, setLocalSearch] = useState("");
	const [exportingId, setExportingId] = useState<string | null>(null);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();
	const { org } = useOrganization();
	const { members } = useOrgMembers();

	const handleExportPdf = useCallback(
		async (queryId: string, e: React.MouseEvent) => {
			e.stopPropagation();
			if (!jwt) return;
			setExportingId(queryId);
			try {
				const response = await getQuery(queryId, { jwt });
				await generateScreeningPdf(
					response.result,
					{ name: org?.name ?? "Organization", logo: org?.logo },
					language as "es" | "en",
					t,
				);
			} catch (err) {
				console.error("PDF generation failed:", err);
			} finally {
				setExportingId(null);
			}
		},
		[jwt, org, language, t],
	);

	// Parse and sanitize search params
	const {
		search: paramSearch,
		filter: paramFilter,
		offset: paramOffset,
	} = useMemo(() => {
		return sanitizeSearchParams(
			searchParams.get("search") || "",
			searchParams.get("filter") || "all",
			searchParams.get("offset") || "0",
		);
	}, [searchParams]);

	// Update local search when URL params change (normalize to uppercase)
	useEffect(() => {
		setLocalSearch(paramSearch.toUpperCase());
	}, [paramSearch]);

	// Update URL when state changes
	const updateSearchParams = useCallback(
		(newSearch?: string, newFilter?: string, newOffset?: number) => {
			const params = new URLSearchParams();
			const search = newSearch !== undefined ? newSearch : paramSearch;
			const filter = newFilter !== undefined ? newFilter : paramFilter;
			const offset = newOffset !== undefined ? newOffset : paramOffset;

			if (search) params.set("search", search);
			if (filter !== "all") params.set("filter", filter);
			if (offset > 0) params.set("offset", offset.toString());

			const queryString = params.toString();
			router.push(queryString ? `/queries?${queryString}` : "/queries");
		},
		[router, paramSearch, paramFilter, paramOffset],
	);

	const updateSearchParamsRef = useRef(updateSearchParams);
	updateSearchParamsRef.current = updateSearchParams;

	const debouncedSetSearchInUrl = useMemo(
		() =>
			debounce((value: string) => {
				updateSearchParamsRef.current(value, undefined, 0);
			}, SEARCH_DEBOUNCE_MS),
		[],
	);

	useEffect(() => {
		return () => {
			debouncedSetSearchInUrl.cancel();
		};
	}, [debouncedSetSearchInUrl]);

	// Fetch queries with pagination
	useEffect(() => {
		const fetchQueries = async () => {
			if (jwtLoading || !jwt) return;

			setIsLoading(true);
			try {
				const response = await listQueries(
					{
						offset: paramOffset,
						limit: LIMIT,
					},
					{ jwt },
				);
				setQueries(response.queries);
				setTotalCount(response.pagination.total);
			} catch (error) {
				console.error("Failed to fetch queries:", error);
				setQueries([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQueries();
	}, [jwt, jwtLoading, paramOffset]);

	// Check watchlist product access - early return after all hooks
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

	// Local client-side filtering
	const filteredQueries = queries.filter((q) => {
		const matchesSearch = q.query
			.toLowerCase()
			.includes(paramSearch.toLowerCase());
		const matchesType =
			paramFilter === "all" ||
			q.entityType === paramFilter ||
			(paramFilter === "person" && !q.entityType);
		return matchesSearch && matchesType;
	});

	const statusLabels: Record<string, string> = {
		pending: t("statusPending"),
		running: t("statusRunning"),
		completed: t("statusCompleted"),
		failed: t("statusFailed"),
		partial: t("statusPartial"),
	};

	const sourceLabels: Record<string, string> = {
		// Canonical values
		watchlist_query: t("sourceWatchlistQuery"),
		aml: t("sourceAml"),
		csv_import: t("sourceCsvImport"),
		api: t("sourceApi"),
		// Backward compatibility
		manual: t("sourceWatchlistQuery"),
		"aml-screening": t("sourceAml"),
		"aml:client": t("sourceAml"),
		"aml:bc": t("sourceAml"),
		import: t("sourceCsvImport"), // legacy CSV import source
	};

	const getSourceLabel = (source: string) =>
		sourceLabels[source] ?? t("sourceUnknown");

	const formatFullDate = (iso: string) => {
		const d = new Date(iso);
		return d.toLocaleString(language === "es" ? "es-MX" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			pending: "secondary",
			running: "default",
			completed: "outline",
			failed: "destructive",
			partial: "secondary",
		};
		return (
			<Badge variant={variants[status] || "default"} className="capitalize">
				{statusLabels[status] || status}
			</Badge>
		);
	};

	type RiskIndicator = "ofac" | "unsc" | "sat69b" | "pep" | "adverseMedia";
	type RiskLevel = "low" | "medium" | "high";
	const getRiskIndicators = (q: QueryListItem): RiskIndicator[] => {
		const out: RiskIndicator[] = [];
		if ((q.ofacCount ?? 0) > 0) out.push("ofac");
		if ((q.unCount ?? 0) > 0) out.push("unsc");
		if ((q.sat69bCount ?? 0) > 0) out.push("sat69b");
		if ((q.pepOfficialCount ?? 0) > 0) out.push("pep");
		if (q.adverseMediaHasRisk === true) out.push("adverseMedia");
		return out;
	};
	/** Badge color by risk level: low = yellow, medium = orange, high = red */
	const getRiskLevelBadgeColor = (level: RiskLevel): string => {
		switch (level) {
			case "low":
				return "bg-yellow-500/10 text-yellow-400";
			case "medium":
				return "bg-orange-500/10 text-orange-400";
			case "high":
				return "bg-red-500/10 text-red-400";
		}
	};
	/** Risk level per indicator: adverse media from API, others are high (sanctions/PEP match) */
	const getIndicatorRiskLevel = (
		key: RiskIndicator,
		q: QueryListItem,
	): RiskLevel => {
		if (key === "adverseMedia" && q.adverseMediaRiskLevel) {
			return q.adverseMediaRiskLevel;
		}
		return "high";
	};
	const riskIndicatorLabels: Record<RiskIndicator, string> = {
		ofac: t("riskIndicatorOfac"),
		unsc: t("riskIndicatorUnsc"),
		sat69b: t("riskIndicatorSat69b"),
		pep: t("riskIndicatorPep"),
		adverseMedia: t("riskIndicatorAdverseMedia"),
	};
	const riskIndicatorBadgeText: Record<RiskIndicator, string> = {
		ofac: "OFAC",
		unsc: "UNSC",
		sat69b: "SAT 69-B",
		pep: "PEP",
		adverseMedia: t("adverseMediaTitle"),
	};

	const hasNextPage = paramOffset + LIMIT < totalCount;
	const hasPrevPage = paramOffset > 0;

	if (isLoading) {
		return (
			<main className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8">
				<div className="max-w-6xl mx-auto flex-1 w-full">
					{/* Header skeleton */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-4">
							<Skeleton className="h-8 md:h-10 w-64 md:w-96" />
						</div>
						<Skeleton className="h-4 w-72" />
					</div>

					{/* Filters skeleton */}
					<div className="mb-6 flex flex-col md:flex-row gap-4">
						<Skeleton className="h-10 flex-1 rounded-md" />
						<div className="flex gap-2">
							<Skeleton className="h-10 w-20 rounded-md" />
							<Skeleton className="h-10 w-32 rounded-md" />
							<Skeleton className="h-10 w-32 rounded-md" />
						</div>
					</div>

					{/* Table skeleton */}
					<div className="rounded-lg border bg-card overflow-hidden">
						<div className="border-b px-4 py-3">
							<div className="flex gap-4">
								<Skeleton className="h-4 w-48 flex-1" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>
						{[...Array(20)].map((_, i) => (
							<div
								key={i}
								className="border-b last:border-b-0 px-4 py-4 flex items-center gap-4"
							>
								<Skeleton className="h-4 w-48 flex-1" />
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded" />
									<Skeleton className="h-4 w-20" />
								</div>
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-4 rounded" />
									<Skeleton className="h-4 w-24" />
								</div>
								<Skeleton className="h-6 w-24 rounded-full" />
							</div>
						))}
					</div>

					{/* Pagination skeleton */}
					<div className="mt-6 mb-6 flex items-center justify-between">
						<Skeleton className="h-4 w-48" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-24 rounded-md" />
							<Skeleton className="h-9 w-24 rounded-md" />
						</div>
					</div>

					{/* Footer skeleton */}
					<footer className="mt-auto pt-6 border-t border-border/50">
						<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
							<Skeleton className="h-3 w-20" />
							<div className="flex items-center gap-4">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>
					</footer>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 flex flex-col px-4 sm:px-6 py-6 sm:py-8">
			<div className="max-w-6xl mx-auto flex-1 flex flex-col w-full">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-start justify-between gap-4 mb-4">
						<h1 className="text-2xl md:text-4xl font-bold">
							{t("queryHistoryTitle")}
						</h1>
						<Button onClick={() => router.push("/")} className="shrink-0 gap-2">
							<Plus className="h-4 w-4" />
							{t("newQuery")}
						</Button>
					</div>
					<p className="text-muted-foreground">
						{t("queryHistoryDescription")}
					</p>
				</div>

				{/* Filters */}
				<div className="mb-6 flex flex-col md:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
						<Input
							value={localSearch}
							onChange={(e) => {
								const value = e.target.value.toUpperCase();
								setLocalSearch(value);
								debouncedSetSearchInUrl(value);
							}}
							placeholder={t("searchQueriesPlaceholder")}
							className="pl-10 bg-card border uppercase"
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant={paramFilter === "all" ? "default" : "outline"}
							onClick={() => updateSearchParams(undefined, "all", 0)}
						>
							{t("filterAll")}
						</Button>
						<Button
							variant={paramFilter === "person" ? "default" : "outline"}
							onClick={() => updateSearchParams(undefined, "person", 0)}
							className="gap-2"
						>
							<User className="h-4 w-4" />
							{t("filterIndividual")}
						</Button>
						<Button
							variant={paramFilter === "organization" ? "default" : "outline"}
							onClick={() => updateSearchParams(undefined, "organization", 0)}
							className="gap-2"
						>
							<Building2 className="h-4 w-4" />
							{t("filterCompany")}
						</Button>
					</div>
				</div>

				{/* Table */}
				<div className="rounded-lg border bg-card overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t("tableQuery")}</TableHead>
								<TableHead>{t("tableSource")}</TableHead>
								<TableHead>{t("tableUser")}</TableHead>
								<TableHead>{t("tableDate")}</TableHead>
								<TableHead>{t("tableStatus")}</TableHead>
								<TableHead>{t("tableRiskIndicators")}</TableHead>
								<TableHead className="w-10" aria-label={t("exportPdf")} />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredQueries.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="text-center py-12 text-muted-foreground"
									>
										{paramSearch || paramFilter !== "all"
											? t("noQueriesFound")
											: t("noQueriesYet")}
									</TableCell>
								</TableRow>
							) : (
								filteredQueries.map((query) => (
									<TableRow
										key={query.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => router.push(`/queries/${query.id}`)}
									>
										<TableCell>
											<div className="flex items-center gap-2">
												{query.entityType === "organization" ? (
													<Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
												) : (
													<User className="h-4 w-4 text-muted-foreground shrink-0" />
												)}
												<span className="font-medium">{query.query}</span>
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm text-muted-foreground">
												{getSourceLabel(query.source ?? "manual")}
											</span>
										</TableCell>
										<TableCell>
											{(() => {
												const display =
													query.userDisplay ??
													(query.userId && members[query.userId]
														? {
																name: members[query.userId].name,
																image: members[query.userId].image ?? null,
															}
														: null);
												if (display) {
													return (
														<TooltipProvider delayDuration={200}>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="flex items-center gap-2 min-w-0 max-w-[180px]">
																		<Avatar className="h-7 w-7 shrink-0">
																			{display.image ? (
																				<AvatarImage
																					src={display.image}
																					alt={display.name}
																				/>
																			) : null}
																			<AvatarFallback className="text-xs">
																				{getInitials(display.name)}
																			</AvatarFallback>
																		</Avatar>
																		<span className="text-sm text-muted-foreground truncate">
																			{display.name}
																		</span>
																	</div>
																</TooltipTrigger>
																<TooltipContent>{display.name}</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													);
												}
												if (query.userId) {
													// Legacy import-worker (or similar) — show friendly label
													if (query.userId.startsWith("import-")) {
														return (
															<span className="text-sm text-muted-foreground">
																{t("userImportLabel")}
															</span>
														);
													}
													return (
														<span className="text-sm text-muted-foreground truncate max-w-[120px] inline-block">
															{query.userId.slice(0, 8)}…
														</span>
													);
												}
												return (
													<span className="text-sm text-muted-foreground">
														—
													</span>
												);
											})()}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
												<Clock className="h-3 w-3 shrink-0" />
												{formatFullDate(query.createdAt)}
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(query.status)}</TableCell>
										<TableCell>
											{(() => {
												const indicators = getRiskIndicators(query);
												if (indicators.length === 0) {
													return (
														<span
															className="text-sm text-muted-foreground"
															aria-label={t("riskIndicatorNone")}
														>
															—
														</span>
													);
												}
												return (
													<div
														className="flex flex-wrap gap-1"
														role="list"
														aria-label={t("tableRiskIndicators")}
													>
														{indicators.map((key) => {
															const level = getIndicatorRiskLevel(key, query);
															return (
																<TooltipProvider key={key} delayDuration={200}>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Badge
																				className={cn(
																					"text-xs font-normal",
																					getRiskLevelBadgeColor(level),
																				)}
																				role="listitem"
																			>
																				{riskIndicatorBadgeText[key]}
																			</Badge>
																		</TooltipTrigger>
																		<TooltipContent>
																			{riskIndicatorLabels[key]}
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															);
														})}
													</div>
												);
											})()}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												disabled={
													query.status !== "completed" ||
													exportingId === query.id
												}
												onClick={(e) => handleExportPdf(query.id, e)}
												title={t("exportPdf")}
											>
												{exportingId === query.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Download className="h-4 w-4" />
												)}
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className="mt-6 mb-6 flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						{t("showingQueries")
							.replace("{from}", String(paramOffset + 1))
							.replace(
								"{to}",
								String(Math.min(paramOffset + LIMIT, totalCount)),
							)
							.replace("{total}", String(totalCount))}
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								updateSearchParams(undefined, undefined, paramOffset - LIMIT)
							}
							disabled={!hasPrevPage}
							className="gap-1"
						>
							<ChevronLeft className="h-4 w-4" />
							{t("previous")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								updateSearchParams(undefined, undefined, paramOffset + LIMIT)
							}
							disabled={!hasNextPage}
							className="gap-1"
						>
							{t("next")}
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Footer */}
				<footer className="mt-auto pt-6 border-t border-border/50">
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
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
			</div>
		</main>
	);
}
