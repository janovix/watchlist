"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { ArrowLeft, AlertCircle, Loader2, User, Building2 } from "lucide-react";
import { useJwt } from "@/hooks/useJwt";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { ScreeningResultsCard } from "@/components/screening-results-card";
import { useLanguage } from "@/components/language-provider";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";
import type { QueryStatus } from "@/lib/api/queries";

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: QueryStatus }) {
	const variants: Record<
		QueryStatus,
		"default" | "secondary" | "destructive" | "outline"
	> = {
		pending: "secondary",
		running: "default",
		completed: "outline",
		failed: "destructive",
	};
	const labels: Record<QueryStatus, string> = {
		pending: "Pendiente",
		running: "Procesando",
		completed: "Completado",
		failed: "Fallido",
	};
	return (
		<Badge variant={variants[status] ?? "default"} className="capitalize">
			{labels[status] ?? status}
		</Badge>
	);
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function QueryDetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-9 w-36" />
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-4 w-48" />
			</div>
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="rounded-lg border-2 border-muted/30 px-4 py-4"
					>
						<div className="flex items-center gap-3">
							<Skeleton className="h-5 w-5 rounded-full" />
							<Skeleton className="h-5 w-48" />
							<Skeleton className="h-5 w-20 rounded-full ml-auto" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function QueryDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { t } = useLanguage();
	const [mounted, setMounted] = useState(false);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

	const queryId = params?.queryId as string;

	const { data, isLoading, error, connectionStatus } = useSearchQuery({
		queryId,
		jwt: jwt ?? undefined,
		enabled: mounted && !jwtLoading && !!queryId,
	});

	useEffect(() => {
		setMounted(true);
	}, []);

	// Access control
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
		<main className="min-h-screen flex flex-col">
			<div className="flex-1 px-4 py-6 sm:py-8 max-w-4xl mx-auto w-full space-y-6">
				{/* Back + New Search */}
				<div className="flex items-center justify-between">
					<Button
						variant="ghost"
						className="-ml-2"
						onClick={() => router.push("/queries")}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Queries
					</Button>
					<Button variant="outline" onClick={() => router.push("/")}>
						{t("newSearch")}
					</Button>
				</div>

				{/* Loading state */}
				{(isLoading || jwtLoading) && !data && <QueryDetailSkeleton />}

				{/* Error state */}
				{error && !isLoading && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* Query loaded */}
				{data && (
					<>
						{/* Header */}
						<div className="flex items-start justify-between gap-4">
							<div>
								<div className="flex items-center gap-3 mb-1">
									{data.entityType === "individual" ? (
										<User className="h-5 w-5 text-muted-foreground" />
									) : data.entityType === "company" ? (
										<Building2 className="h-5 w-5 text-muted-foreground" />
									) : null}
									<h1 className="text-2xl font-bold font-mono uppercase">
										{data.query}
									</h1>
								</div>
								<div className="flex items-center gap-3 text-sm text-muted-foreground">
									{data.entityType && (
										<>
											<span className="capitalize">{data.entityType}</span>
											<span>•</span>
										</>
									)}
									{data.birthDate && (
										<>
											<span>{data.birthDate}</span>
											<span>•</span>
										</>
									)}
									<span>{new Date(data.createdAt).toLocaleString()}</span>
								</div>
							</div>
							<StatusBadge status={data.status} />
						</div>

						{/* Running indicator */}
						{data.status === "running" && (
							<div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<span className="text-sm text-muted-foreground">
									Procesando búsquedas asíncronas (PEP, Media Adversa)…
								</span>
							</div>
						)}

						{/* Results */}
						<ScreeningResultsCard
							data={data}
							connectionStatus={connectionStatus}
						/>
					</>
				)}
			</div>
		</main>
	);
}
