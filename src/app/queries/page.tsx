"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, User, Building2 } from "lucide-react";
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

export default function QueriesPage() {
	const router = useRouter();
	const { t } = useLanguage();
	const [queries, setQueries] = useState<QueryListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<
		"all" | "person" | "organization"
	>("all");
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

	// Check watchlist product access
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

	useEffect(() => {
		const fetchQueries = async () => {
			if (jwtLoading || !jwt) return;

			try {
				const response = await listQueries({}, { jwt });
				setQueries(response.result.queries);
			} catch (error) {
				console.error("Failed to fetch queries:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchQueries();
	}, [jwt, jwtLoading]);

	const filteredQueries = queries.filter((q) => {
		const matchesSearch = q.query
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesType =
			filterType === "all" ||
			q.entityType === filterType ||
			(filterType === "person" && !q.entityType);
		return matchesSearch && matchesType;
	});

	const getStatusBadge = (status: string) => {
		const variants: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			pending: "secondary",
			running: "default",
			completed: "outline",
			failed: "destructive",
		};
		return (
			<Badge variant={variants[status] || "default"} className="capitalize">
				{status}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<main className="min-h-screen p-4 md:p-8 pt-20">
				<div className="max-w-6xl mx-auto">
					{/* Header skeleton */}
					<div className="mb-8">
						<Skeleton className="h-9 w-48 mb-4" />
						<Skeleton className="h-4 w-72" />
					</div>

					{/* Filters skeleton */}
					<div className="mb-6 flex flex-col md:flex-row gap-4">
						<Skeleton className="h-10 flex-1 rounded-md" />
						<div className="flex gap-2">
							<Skeleton className="h-10 w-16 rounded-md" />
							<Skeleton className="h-10 w-28 rounded-md" />
							<Skeleton className="h-10 w-28 rounded-md" />
						</div>
					</div>

					{/* Table skeleton */}
					<div className="rounded-lg border bg-card/95 backdrop-blur-sm overflow-hidden">
						<div className="border-b px-4 py-3 flex gap-4">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-16" />
						</div>
						{[...Array(5)].map((_, i) => (
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
									<Skeleton className="h-3 w-3 rounded" />
									<Skeleton className="h-4 w-24" />
								</div>
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
						))}
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen p-4 md:p-8 pt-20">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<h1 className="text-2xl md:text-4xl font-bold">Query History</h1>
					</div>
					<p className="text-muted-foreground">
						View and manage your past background checks
					</p>
				</div>

				{/* Filters */}
				<div className="mb-6 flex flex-col md:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
						<Input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search queries..."
							className="pl-10 bg-card/80 backdrop-blur-sm border"
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant={filterType === "all" ? "default" : "outline"}
							onClick={() => setFilterType("all")}
						>
							All
						</Button>
						<Button
							variant={filterType === "person" ? "default" : "outline"}
							onClick={() => setFilterType("person")}
							className="gap-2"
						>
							<User className="h-4 w-4" />
							Individual
						</Button>
						<Button
							variant={filterType === "organization" ? "default" : "outline"}
							onClick={() => setFilterType("organization")}
							className="gap-2"
						>
							<Building2 className="h-4 w-4" />
							Company
						</Button>
					</div>
				</div>

				{/* Table */}
				<div className="rounded-lg border bg-card/95 backdrop-blur-sm overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Query</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredQueries.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										className="text-center py-12 text-muted-foreground"
									>
										{searchTerm || filterType !== "all"
											? "No queries found matching your filters"
											: "No queries yet. Start by searching for an individual or company."}
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
														? "Company"
														: "Individual"}
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
								Privacy
							</a>
							<a
								href="https://janovix.com/terms"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-foreground transition-colors"
							>
								Terms
							</a>
						</div>
					</div>
				</footer>
			</div>
		</main>
	);
}
