"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { getPrivacyUrl, getTermsUrl } from "@/lib/config-urls";
import {
	ArrowLeft,
	AlertCircle,
	Loader2,
	User,
	Building2,
	Download,
} from "lucide-react";
import { useJwt } from "@/hooks/useJwt";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { ScreeningResultsCard } from "@/components/screening-results-card";
import { useLanguage } from "@/components/language-provider";
import { useOrganization } from "@/hooks/useOrganization";
import { useWatchlistConfig } from "@/hooks/useWatchlistConfig";
import { generateScreeningPdf } from "@/lib/pdf/generate-screening-pdf";
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
		partial: "secondary",
		failed: "destructive",
		skipped: "secondary",
	};
	const { t } = useLanguage();
	const labels: Record<QueryStatus, string> = {
		pending: t("statusPending"),
		running: t("statusRunning"),
		completed: t("statusCompleted"),
		partial: t("statusPartial"),
		failed: t("statusFailed"),
		skipped: t("statusSkipped"),
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
		<div className="space-y-4">
			{/* Header: mirrors real layout — flex row with title+subtitle left, badge right */}
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					{/* Title row: icon + h1 text-2xl (line-height 2rem = 32px) */}
					<div className="flex items-center gap-3">
						<Skeleton className="h-5 w-5 rounded-full" />
						<Skeleton className="h-8 w-56" />
					</div>
					{/* Subtitle row: text-sm (line-height 1.25rem = 20px) */}
					<Skeleton className="h-5 w-48" />
				</div>
				{/* StatusBadge */}
				<Skeleton className="h-6 w-20 rounded-full shrink-0" />
			</div>
			<div className="space-y-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-border bg-card px-5 py-4"
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
	const { language, t } = useLanguage();
	const [mounted, setMounted] = useState(false);
	const [exporting, setExporting] = useState(false);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const { org } = useOrganization();
	const { features } = useWatchlistConfig();

	const queryId = params?.queryId as string;

	const { data, isLoading, error, connectionStatus, progressMessages } =
		useSearchQuery({
			queryId,
			jwt: jwt ?? undefined,
			enabled: mounted && !jwtLoading && !!queryId,
		});

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleExportPdf = useCallback(async () => {
		if (!data || data.status !== "completed") return;
		setExporting(true);
		try {
			await generateScreeningPdf(
				data,
				{ name: org?.name ?? "Organization", logo: org?.logo },
				language as "es" | "en",
				t,
			);
		} catch (err) {
			console.error("PDF generation failed:", err);
		} finally {
			setExporting(false);
		}
	}, [data, org, language, t]);

	if (!mounted) {
		return (
			<main className="flex-1 flex items-center justify-center">
				<div className="flex items-center gap-3">
					<Logo variant="icon" width={32} height={32} />
					<span className="text-muted-foreground">{t("loading")}</span>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 flex flex-col">
			<div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto w-full space-y-6">
				{/* Back + New Search */}
				<div className="flex flex-wrap items-center justify-between gap-2">
					<Button
						variant="ghost"
						className="-ml-2"
						onClick={() => router.push("/queries")}
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("backToQueries")}
					</Button>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!data || data.status !== "completed" || exporting}
							onClick={handleExportPdf}
							className="gap-2"
						>
							{exporting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Download className="h-4 w-4" />
							)}
							{exporting ? t("exportingPdf") : t("exportPdf")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push("/")}
						>
							{t("newSearch")}
						</Button>
					</div>
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
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-3 mb-1">
									{data.entityType === "individual" ? (
										<User className="h-5 w-5 text-muted-foreground shrink-0" />
									) : data.entityType === "company" ? (
										<Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
									) : null}
									<h1 className="text-2xl font-bold font-mono uppercase wrap-break-word">
										{data.query}
									</h1>
								</div>
								<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
									{data.entityType && (
										<>
											<span className="capitalize">{data.entityType}</span>
											<span>•</span>
										</>
									)}
									{data.birthDate && (
										<>
											<span>
												{data.birthDate.includes("T")
													? data.birthDate.slice(0, 10)
													: data.birthDate}
											</span>
											<span>•</span>
										</>
									)}
									{data.countries && data.countries.length > 0 && (
										<>
											<span>
												{t("countries")}: {data.countries.join(", ")}
											</span>
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
							<div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<span className="text-sm text-muted-foreground">
									{t("processingAsync")}
								</span>
							</div>
						)}

						{/* Results */}
						<ScreeningResultsCard
							data={data}
							connectionStatus={connectionStatus}
							progressMessages={progressMessages}
							features={features}
						/>
					</>
				)}
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
