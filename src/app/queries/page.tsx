"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Search,
	Clock,
	User,
	Building2,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { listQueries, type QueryListItem } from "@/lib/api/queries";
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

const LIMIT = 20;
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
	const { t } = useLanguage();
	const [queries, setQueries] = useState<QueryListItem[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [localSearch, setLocalSearch] = useState("");
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

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

	// Update local search when URL params change
	useEffect(() => {
		setLocalSearch(paramSearch);
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
					<div className="mt-6 flex items-center justify-between">
						<Skeleton className="h-4 w-48" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-24 rounded-md" />
							<Skeleton className="h-9 w-24 rounded-md" />
						</div>
					</div>

					{/* Footer skeleton */}
					<footer className="mt-12 pt-6 border-t border-border/50">
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
		<main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<h1 className="text-2xl md:text-4xl font-bold">
							{t("queryHistoryTitle")}
						</h1>
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
								setLocalSearch(e.target.value);
								updateSearchParams(e.target.value, undefined, 0);
							}}
							placeholder={t("searchQueriesPlaceholder")}
							className="pl-10 bg-card border"
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
								<TableHead>{t("tableType")}</TableHead>
								<TableHead>{t("tableDate")}</TableHead>
								<TableHead>{t("tableStatus")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredQueries.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
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
										<TableCell className="font-medium">{query.query}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{query.entityType === "organization" ? (
													<Building2 className="h-4 w-4 text-muted-foreground" />
												) : (
													<User className="h-4 w-4 text-muted-foreground" />
												)}
												<span className="capitalize">
													{query.entityType === "organization"
														? t("filterCompany")
														: t("filterIndividual")}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Clock className="h-3 w-3" />
												{new Date(query.createdAt).toLocaleDateString()}
											</div>
										</TableCell>
										<TableCell>{getStatusBadge(query.status)}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				<div className="mt-6 flex items-center justify-between">
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
				<footer className="mt-12 pt-6 border-t border-border/50">
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-2 opacity-80">
							<Logo variant="logo" width={80} height={14} />
						</div>
						<div className="flex items-center gap-4">
							<span>&copy; {new Date().getFullYear()} Janovix</span>
							<a
								href="https://janovix.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground transition-colors"
							>
								{t("privacy")}
							</a>
							<a
								href="https://janovix.com/terms"
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
