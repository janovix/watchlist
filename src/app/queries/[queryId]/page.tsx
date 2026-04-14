"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/footer";
import {
	ArrowLeft,
	AlertCircle,
	User,
	Building2,
	Download,
} from "lucide-react";
import { useJwt } from "@/hooks/useJwt";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { ScreeningResultsCard } from "@/components/screening-results-card";
import { useLanguage } from "@/components/language-provider";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import { useWatchlistConfig } from "@/hooks/useWatchlistConfig";
import { generateScreeningPdf } from "@/lib/pdf/generate-screening-pdf";
import type { QueryStatus, SearchQuery } from "@/lib/api/queries";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LAYOUT_HORIZONTAL_PAD, LAYOUT_NARROW } from "@/lib/layout";
import { cn } from "@/lib/utils";

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
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-2 flex-1 min-w-0">
					<div className="flex items-center gap-3">
						<Skeleton className="h-5 w-5 rounded-full shrink-0" />
						<Skeleton className="h-8 w-56 max-w-full" />
					</div>
					<Skeleton className="h-5 w-full max-w-md" />
					<div className="flex flex-wrap gap-2 pt-1">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-4 w-40" />
					</div>
				</div>
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

/** Toolbar + body skeleton for route transitions and pre-hydration. */
export function QueryDetailPageSkeleton() {
	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Skeleton className="h-10 w-44 rounded-md" />
				<div className="flex flex-wrap items-center gap-2">
					<Skeleton className="h-8 w-36 rounded-md" />
					<Skeleton className="h-8 w-44 rounded-md" />
				</div>
			</div>
			<QueryDetailSkeleton />
		</>
	);
}

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
	const { members } = useOrgMembers();
	const { features } = useWatchlistConfig();

	const queryId = params?.queryId as string;

	const { data, isLoading, error, progressMessages } = useSearchQuery({
		queryId,
		jwt: jwt ?? undefined,
		enabled: mounted && !jwtLoading && !!queryId,
	});

	const sourceLabels = useMemo(
		() =>
			({
				watchlist_query: t("sourceWatchlistQuery"),
				aml: t("sourceAml"),
				csv_import: t("sourceCsvImport"),
				api: t("sourceApi"),
				manual: t("sourceWatchlistQuery"),
				"aml-screening": t("sourceAml"),
				"aml:client": t("sourceAml"),
				"aml:bc": t("sourceAml"),
				import: t("sourceCsvImport"),
			}) as Record<string, string>,
		[t],
	);

	const getSourceLabel = (source: string) =>
		sourceLabels[source] ?? t("sourceUnknown");

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
				features,
			);
		} catch (err) {
			console.error("PDF generation failed:", err);
		} finally {
			setExporting(false);
		}
	}, [data, org, language, t, features]);

	const renderSourceUserMeta = (d: SearchQuery) => {
		const sourceKey = d.source ?? "manual";
		const display =
			d.userDisplay ??
			(d.userId && members[d.userId]
				? {
						name: members[d.userId].name,
						image: members[d.userId].image ?? null,
					}
				: null);

		return (
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground mt-2">
				<span>
					<span className="font-medium text-foreground/80">
						{t("tableSource")}:{" "}
					</span>
					{getSourceLabel(sourceKey)}
				</span>
				<span aria-hidden className="text-border">
					•
				</span>
				<span className="inline-flex items-center gap-2 min-w-0">
					<span className="font-medium text-foreground/80 shrink-0">
						{t("tableUser")}:{" "}
					</span>
					{display ? (
						<TooltipProvider delayDuration={200}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="inline-flex items-center gap-2 min-w-0 max-w-[220px]">
										<Avatar className="h-7 w-7 shrink-0">
											{display.image ? (
												<AvatarImage src={display.image} alt={display.name} />
											) : null}
											<AvatarFallback className="text-xs">
												{getInitials(display.name)}
											</AvatarFallback>
										</Avatar>
										<span className="truncate">{display.name}</span>
									</span>
								</TooltipTrigger>
								<TooltipContent>{display.name}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : d.userId ? (
						d.userId.startsWith("import-") ? (
							<span>{t("userImportLabel")}</span>
						) : (
							<span className="truncate max-w-[140px]">
								{d.userId.slice(0, 8)}…
							</span>
						)
					) : (
						<span>—</span>
					)}
				</span>
			</div>
		);
	};

	const mainInner = (
		<div
			className={cn(
				"flex-1 space-y-6 py-6 sm:py-8",
				LAYOUT_HORIZONTAL_PAD,
				LAYOUT_NARROW,
			)}
		>
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
						loading={exporting}
						disabled={!data || data.status !== "completed"}
						onClick={handleExportPdf}
						className="gap-2"
					>
						{!exporting && <Download className="h-4 w-4" />}
						{exporting ? t("exportingPdf") : t("exportPdf")}
					</Button>
					<Button variant="outline" size="sm" onClick={() => router.push("/")}>
						{t("newSearch")}
					</Button>
				</div>
			</div>

			{(isLoading || jwtLoading) && !data && <QueryDetailSkeleton />}

			{error && !isLoading && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{data && (
				<>
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
							{renderSourceUserMeta(data)}
						</div>
						<StatusBadge status={data.status} />
					</div>

					{data.status === "running" && (
						<div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
							<Spinner className="h-5 w-5 text-primary" />
							<span className="text-sm text-muted-foreground">
								{t("processingAsync")}
							</span>
						</div>
					)}

					<ScreeningResultsCard
						data={data}
						progressMessages={progressMessages}
						features={features}
					/>
				</>
			)}
		</div>
	);

	if (!mounted) {
		return (
			<div className="flex flex-1 flex-col min-h-0 w-full">
				<main className="flex-1 flex flex-col">
					<div
						className={cn(
							"flex-1 space-y-6 py-6 sm:py-8",
							LAYOUT_HORIZONTAL_PAD,
							LAYOUT_NARROW,
						)}
					>
						<QueryDetailPageSkeleton />
					</div>
				</main>
				<Footer />
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col min-h-0 w-full">
			<main className="flex-1 flex flex-col">{mainInner}</main>
			<Footer />
		</div>
	);
}
