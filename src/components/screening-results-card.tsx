"use client";

import { CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { MatchResultsList } from "@/components/match-results-list";
import { useLanguage } from "@/components/language-provider";
import {
	ExternalLinkDialog,
	useExternalLinkRedirect,
	looksLikeUrl,
	ensureProtocol,
	extractHostname,
} from "@/components/external-link-dialog";
import { Favicon } from "@/components/favicon";
import type { SearchQuery, QueryStatus } from "@/lib/api/queries";
import type { ProgressMessages } from "@/hooks/useSearchQuery";
import type { PepRawResult } from "@/hooks/usePepSearch";
import type { WatchlistFeatures } from "@/lib/api/watchlist-config";

// ---------------------------------------------------------------------------
// Shape types for async result payloads stored in the DB / received via SSE
// ---------------------------------------------------------------------------

interface GrokPepResult {
	probability: number;
	summary: string | { es: string; en: string };
	sources?: string[];
}

interface AdverseMediaResult {
	risk_level: "none" | "low" | "medium" | "high";
	findings?: string | { es: string; en: string };
	sources?: string[];
}

interface ErrorResult {
	error: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extract the correct language text from a bilingual field or plain string.
 * Falls back to Spanish for Portuguese since backend doesn't provide Portuguese translations.
 */
function getBilingualText(
	value: string | { es: string; en: string } | undefined,
	language: "es" | "en",
): string {
	if (!value) return "";
	if (typeof value === "string") return value;
	return value[language] || value.es || "";
}

type ItemStatus = "loading" | "complete_clear" | "complete_match" | "failed";

/** Risk level for PEP and Adverse Media: low = yellow, medium = orange, high = red */
type RiskLevel = "none" | "low" | "medium" | "high";

function resolveItemStatus(
	status: QueryStatus | null | undefined,
	count: number | null | undefined,
): ItemStatus {
	if (!status || status === "pending" || status === "running") return "loading";
	if (status === "failed") return "failed";
	return (count ?? 0) > 0 ? "complete_match" : "complete_clear";
}

function resolveAsyncItemStatus(
	status: QueryStatus | null | undefined,
	hasContent: boolean,
): ItemStatus {
	if (!status || status === "pending" || status === "running") return "loading";
	if (status === "failed") return "failed";
	return hasContent ? "complete_match" : "complete_clear";
}

function getStatusIcon(itemStatus: ItemStatus) {
	switch (itemStatus) {
		case "loading":
			return <Spinner className="h-5 w-5 text-muted-foreground" />;
		case "complete_clear":
			return <CheckCircle2 className="h-5 w-5 text-green-500" />;
		case "complete_match":
			return <AlertTriangle className="h-5 w-5 text-red-500" />;
		case "failed":
			return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
	}
}

/** Max coincidence score (0–1) across matches; used for OFAC/UNSC/SAT 69-B semaphore icon */
function getMaxScoreFromMatches(
	matches: Array<{ score?: number }> | undefined,
): number {
	if (!Array.isArray(matches) || matches.length === 0) return 0;
	const scores = matches
		.map((m) => (typeof m.score === "number" ? m.score : 0))
		.filter((s) => s > 0);
	return scores.length === 0 ? 0 : Math.max(...scores);
}

/** Map max score to risk level for section icon: low = yellow, medium = orange, high = red */
function watchlistScoreToRiskLevel(score: number): RiskLevel {
	if (score > 0.75) return "high";
	if (score > 0.5) return "medium";
	return "low";
}

/** Icon for OFAC/UNSC/SAT 69-B: semaphore by max coincidence when there are matches, else status icon */
function getWatchlistSectionIcon(
	itemStatus: ItemStatus,
	matches: Array<{ score?: number }> | undefined,
) {
	if (
		itemStatus !== "complete_match" ||
		!Array.isArray(matches) ||
		matches.length === 0
	) {
		return getStatusIcon(itemStatus);
	}
	const maxScore = getMaxScoreFromMatches(matches);
	return getRiskLevelIcon(watchlistScoreToRiskLevel(maxScore));
}

/** Badge for OFAC/UNSC/SAT 69-B: "Coincidencias" with semaphore color when matches exist, else standard status badge */
function WatchlistSectionBadge({
	itemStatus,
	matches,
}: {
	itemStatus: ItemStatus;
	matches: Array<{ score?: number }> | undefined;
}) {
	const { t } = useLanguage();
	if (
		itemStatus === "complete_match" &&
		Array.isArray(matches) &&
		matches.length > 0
	) {
		const maxScore = getMaxScoreFromMatches(matches);
		const riskLevel = watchlistScoreToRiskLevel(maxScore);
		return (
			<Badge className={cn("text-xs", getRiskLevelBadgeColor(riskLevel))}>
				{t("statusMatches")}
			</Badge>
		);
	}
	return <StatusBadgeLabel itemStatus={itemStatus} />;
}

function getStatusBadgeColor(itemStatus: ItemStatus): string {
	switch (itemStatus) {
		case "loading":
			return "bg-muted/20 text-muted-foreground";
		case "complete_clear":
			return "bg-green-500/10 text-green-400";
		case "complete_match":
			return "bg-yellow-500/10 text-yellow-400";
		case "failed":
			return "bg-yellow-500/10 text-yellow-400";
	}
}

/** Map risk level to icon and badge styling: low = yellow, medium = orange, high = red */
function getRiskLevelIcon(risk: RiskLevel) {
	switch (risk) {
		case "none":
			return <CheckCircle2 className="h-5 w-5 text-green-500" />;
		case "low":
			return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
		case "medium":
			return <AlertTriangle className="h-5 w-5 text-orange-500" />;
		case "high":
			return <AlertTriangle className="h-5 w-5 text-red-500" />;
	}
}

function getRiskLevelBadgeColor(risk: RiskLevel): string {
	switch (risk) {
		case "none":
			return "bg-green-500/10 text-green-400";
		case "low":
			return "bg-yellow-500/10 text-yellow-400";
		case "medium":
			return "bg-orange-500/10 text-orange-400";
		case "high":
			return "bg-red-500/10 text-red-400";
	}
}

/** Map PEP probability (0–1) to risk level for coloring */
function pepProbabilityToRiskLevel(probability: number): RiskLevel {
	if (probability <= 0) return "none";
	if (probability <= 1 / 3) return "low";
	if (probability <= 2 / 3) return "medium";
	return "high";
}

function StatusBadgeLabel({ itemStatus }: { itemStatus: ItemStatus }) {
	const { t } = useLanguage();
	const badgeText = {
		loading: t("statusSearching"),
		complete_clear: t("statusClean"),
		complete_match: t("statusMatches"),
		failed: t("statusError"),
	};

	return (
		<Badge className={`text-xs ${getStatusBadgeColor(itemStatus)}`}>
			{badgeText[itemStatus]}
		</Badge>
	);
}

/** Badge for risk-based sections (PEP, Adverse Media): Limpio vs Coincidencias with risk color */
function RiskSectionBadge({
	riskLevel,
	isLoading,
	isFailed,
}: {
	riskLevel: RiskLevel;
	isLoading: boolean;
	isFailed: boolean;
}) {
	const { t } = useLanguage();
	if (isLoading) {
		return (
			<Badge className="text-xs bg-muted/20 text-muted-foreground">
				{t("statusSearching")}
			</Badge>
		);
	}
	if (isFailed) {
		return (
			<Badge className="text-xs bg-yellow-500/10 text-yellow-400">
				{t("statusError")}
			</Badge>
		);
	}
	const label = riskLevel === "none" ? t("statusClean") : t("statusMatches");
	return (
		<Badge className={cn("text-xs", getRiskLevelBadgeColor(riskLevel))}>
			{label}
		</Badge>
	);
}

function SubsectionBadge({
	status,
}: {
	status: QueryStatus | null | undefined;
}) {
	const { t } = useLanguage();
	if (!status || status === "pending" || status === "running") {
		return (
			<Badge variant="outline" className="gap-1 text-xs">
				<Spinner className="h-3 w-3" />
				{t("statusSearching")}
			</Badge>
		);
	}
	if (status === "failed") {
		return (
			<Badge
				variant="outline"
				className="gap-1 text-xs border-yellow-500/50 text-yellow-600"
			>
				<AlertTriangle className="h-3 w-3" />
				{t("statusError")}
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="gap-1 text-xs border-green-500/50 text-green-600"
		>
			<CheckCircle2 className="h-3 w-3" />
			{t("statusCompleted2")}
		</Badge>
	);
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface ScreeningResultsCardProps {
	data: SearchQuery;
	progressMessages?: ProgressMessages;
	features?: WatchlistFeatures;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ScreeningResultsCard({
	data,
	progressMessages,
	features,
}: ScreeningResultsCardProps) {
	const { language, t } = useLanguage();
	const extLink = useExternalLinkRedirect();

	const adverseMediaRiskLevelLabel = (
		level: AdverseMediaResult["risk_level"],
	) => {
		switch (level) {
			case "none":
				return t("riskLevelNone");
			case "low":
				return t("riskLevelLow");
			case "medium":
				return t("riskLevelMedium");
			case "high":
				return t("riskLevelHigh");
		}
	};

	const showPepSearch = features?.pepSearch ?? true;
	const showPepGrok = features?.pepGrok ?? true;
	const showAdverseMedia = features?.adverseMedia ?? true;
	/** PEP applies to natural persons only, not legal entities */
	const showPepSection =
		(showPepSearch || showPepGrok) && data.entityType !== "organization";

	// Synchronous result statuses
	const ofacStatus = resolveItemStatus(data.ofacStatus, data.ofacCount);
	const unStatus = resolveItemStatus(data.unStatus, data.unCount);
	const sat69bStatus = resolveItemStatus(data.sat69bStatus, data.sat69bCount);

	// Async PEP: determine combined status from both pepOfficial + pepAi
	const pepOfficialRaw = data.pepOfficialResult as
		| PepRawResult[]
		| { error: string }
		| null;
	const pepAiRaw = data.pepAiResult as GrokPepResult | ErrorResult | null;

	const pepOfficialHasMatches =
		Array.isArray(pepOfficialRaw) && pepOfficialRaw.length > 0;
	const pepAiHasMatches =
		pepAiRaw &&
		!("error" in pepAiRaw) &&
		(pepAiRaw as GrokPepResult).probability > 0;

	const pepOfficialItemStatus = resolveAsyncItemStatus(
		data.pepOfficialStatus,
		pepOfficialHasMatches,
	);
	const pepAiItemStatus = resolveAsyncItemStatus(
		data.pepAiStatus,
		!!pepAiHasMatches,
	);

	// Combined PEP item status: only consider enabled subsections
	let pepCombinedStatus: ItemStatus = "complete_clear";
	const pepStatuses: ItemStatus[] = [];
	if (showPepSearch) pepStatuses.push(pepOfficialItemStatus);
	if (showPepGrok) pepStatuses.push(pepAiItemStatus);

	if (pepStatuses.length > 0) {
		if (pepStatuses.some((s) => s === "loading")) {
			pepCombinedStatus = "loading";
		} else if (pepStatuses.some((s) => s === "complete_match")) {
			pepCombinedStatus = "complete_match";
		} else if (pepStatuses.some((s) => s === "failed")) {
			pepCombinedStatus = "failed";
		} else {
			pepCombinedStatus = "complete_clear";
		}
	}

	// Adverse media
	const adverseMediaRaw = data.adverseMediaResult as
		| AdverseMediaResult
		| ErrorResult
		| null;
	const adverseMediaHasRisk =
		adverseMediaRaw &&
		!("error" in adverseMediaRaw) &&
		(adverseMediaRaw as AdverseMediaResult).risk_level !== "none";
	const adverseMediaStatus = resolveAsyncItemStatus(
		data.adverseMediaStatus,
		!!adverseMediaHasRisk,
	);
	const adverseMediaRiskLevel: RiskLevel =
		adverseMediaRaw && !("error" in adverseMediaRaw)
			? (adverseMediaRaw as AdverseMediaResult).risk_level
			: "none";

	// PEP combined risk for section header: official match = high only when PEP search is enabled; else AI probability
	const pepCombinedRiskLevel: RiskLevel =
		showPepSearch && pepOfficialHasMatches
			? "high"
			: pepAiRaw &&
				  !("error" in pepAiRaw) &&
				  typeof (pepAiRaw as GrokPepResult).probability === "number"
				? pepProbabilityToRiskLevel((pepAiRaw as GrokPepResult).probability)
				: "none";

	return (
		<div className="space-y-2 pb-4">
			<Accordion type="multiple" className="space-y-2">
				{/* OFAC */}
				<AccordionItem
					value="ofac"
					className="rounded-xl border border-border bg-card px-4 overflow-hidden"
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getWatchlistSectionIcon(
								ofacStatus,
								(
									data.ofacResult as
										| { matches: Array<{ score: number }> }
										| undefined
								)?.matches,
							)}
							<span className="font-semibold">{t("ofacSanctionsList")}</span>
							<div className="ml-auto">
								<WatchlistSectionBadge
									itemStatus={ofacStatus}
									matches={
										(
											data.ofacResult as
												| { matches: Array<{ score?: number }> }
												| undefined
										)?.matches
									}
								/>
							</div>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{ofacStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								{t("verifyingOfac")}
							</p>
						) : ofacStatus === "complete_clear" ? (
							<p className="text-green-600 text-sm">{t("noOfacMatches")}</p>
						) : (
							data.ofacResult && (
								<MatchResultsList
									matches={
										(
											data.ofacResult as {
												matches: Parameters<
													typeof MatchResultsList
												>[0]["matches"][0][];
											}
										).matches
									}
								/>
							)
						)}
					</AccordionContent>
				</AccordionItem>

				{/* UNSC */}
				<AccordionItem
					value="un"
					className="rounded-xl border border-border bg-card px-4 overflow-hidden"
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getWatchlistSectionIcon(
								unStatus,
								(
									data.unResult as
										| { matches: Array<{ score: number }> }
										| undefined
								)?.matches,
							)}
							<span className="font-semibold">{t("unSanctionsList")}</span>
							<div className="ml-auto">
								<WatchlistSectionBadge
									itemStatus={unStatus}
									matches={
										(
											data.unResult as
												| { matches: Array<{ score?: number }> }
												| undefined
										)?.matches
									}
								/>
							</div>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{unStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								{t("verifyingUn")}
							</p>
						) : unStatus === "complete_clear" ? (
							<p className="text-green-600 text-sm">{t("noUnMatches")}</p>
						) : (
							data.unResult && (
								<MatchResultsList
									matches={
										(
											data.unResult as {
												matches: Parameters<
													typeof MatchResultsList
												>[0]["matches"][0][];
											}
										).matches
									}
								/>
							)
						)}
					</AccordionContent>
				</AccordionItem>

				{/* SAT 69-B */}
				<AccordionItem
					value="sat69b"
					className="rounded-xl border border-border bg-card px-4 overflow-hidden"
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getWatchlistSectionIcon(
								sat69bStatus,
								(
									data.sat69bResult as
										| { matches: Array<{ score: number }> }
										| undefined
								)?.matches,
							)}
							<span className="font-semibold">{t("sat69bTitle")}</span>
							<div className="ml-auto">
								<WatchlistSectionBadge
									itemStatus={sat69bStatus}
									matches={
										(
											data.sat69bResult as
												| { matches: Array<{ score?: number }> }
												| undefined
										)?.matches
									}
								/>
							</div>
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{sat69bStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								{t("verifyingSat69b")}
							</p>
						) : sat69bStatus === "complete_clear" ? (
							<p className="text-green-600 text-sm">{t("noSat69bMatches")}</p>
						) : (
							data.sat69bResult && (
								<MatchResultsList
									matches={
										(
											data.sat69bResult as {
												matches: Parameters<
													typeof MatchResultsList
												>[0]["matches"][0][];
											}
										).matches
									}
								/>
							)
						)}
					</AccordionContent>
				</AccordionItem>

				{/* PEP — merged accordion for Official + AI */}
				{showPepSection && (
					<AccordionItem
						value="pep"
						className="rounded-xl border border-border bg-card px-4 overflow-hidden"
					>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-3 w-full">
								{pepCombinedStatus === "loading"
									? getStatusIcon("loading")
									: pepCombinedStatus === "failed"
										? getStatusIcon("failed")
										: getRiskLevelIcon(pepCombinedRiskLevel)}
								<span className="font-semibold">{t("pepTitle")}</span>
								<div className="ml-auto">
									<RiskSectionBadge
										riskLevel={pepCombinedRiskLevel}
										isLoading={pepCombinedStatus === "loading"}
										isFailed={pepCombinedStatus === "failed"}
									/>
								</div>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-4">
								{/* PEP AI subsection */}
								{showPepGrok && (
									<div className="space-y-2">
										{pepAiItemStatus === "loading" ? (
											<p className="text-muted-foreground text-sm">
												{progressMessages?.pepGrok ?? t("analyzingAi")}
											</p>
										) : pepAiItemStatus === "failed" ? (
											<Alert variant="destructive" className="py-2">
												<AlertDescription className="text-xs">
													{(pepAiRaw as ErrorResult)?.error ?? t("pepAiError")}
												</AlertDescription>
											</Alert>
										) : (
											<div className="space-y-2 text-sm">
												{!pepAiHasMatches && (
													<p className="text-green-600 text-sm">
														{t("pepAiNoMatch")}
													</p>
												)}
												{pepAiRaw &&
													!("error" in pepAiRaw) &&
													typeof (pepAiRaw as GrokPepResult).probability ===
														"number" && (
														<div className="flex items-center gap-2">
															<span className="font-medium">
																{t("probability")}
															</span>
															<Badge
																className={getRiskLevelBadgeColor(
																	pepProbabilityToRiskLevel(
																		(pepAiRaw as GrokPepResult).probability,
																	),
																)}
															>
																{Math.round(
																	(pepAiRaw as GrokPepResult).probability * 100,
																)}
																%
															</Badge>
														</div>
													)}
												{pepAiRaw &&
													!("error" in pepAiRaw) &&
													(pepAiRaw as GrokPepResult).summary && (
														<p className="text-muted-foreground">
															{getBilingualText(
																(pepAiRaw as GrokPepResult).summary,
																language as "es" | "en",
															)}
														</p>
													)}
												{pepAiRaw &&
													!("error" in pepAiRaw) &&
													(pepAiRaw as GrokPepResult).sources &&
													(pepAiRaw as GrokPepResult).sources!.length > 0 && (
														<div>
															<p className="font-medium mb-1">{t("sources")}</p>
															<ul className="list-disc list-inside space-y-1 text-muted-foreground">
																{(pepAiRaw as GrokPepResult).sources!.map(
																	(src, i) => {
																		const isLink = looksLikeUrl(src);
																		const href = isLink
																			? ensureProtocol(src)
																			: null;
																		return (
																			<li key={i} className="text-xs truncate">
																				{isLink && href ? (
																					<a
																						href={href}
																						onClick={(e) =>
																							extLink.handleExternalLink(
																								href,
																								e,
																							)
																						}
																						className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer underline underline-offset-2"
																					>
																						<Favicon
																							url={src}
																							className="h-3 w-3 shrink-0 inline"
																						/>
																						{extractHostname(src)}
																						<ExternalLink className="h-2.5 w-2.5 shrink-0 inline" />
																					</a>
																				) : (
																					src
																				)}
																			</li>
																		);
																	},
																)}
															</ul>
														</div>
													)}
											</div>
										)}
									</div>
								)}
							</div>
						</AccordionContent>
					</AccordionItem>
				)}

				{/* Adverse Media */}
				{showAdverseMedia && (
					<AccordionItem
						value="adverse-media"
						className="rounded-xl border border-border bg-card px-4 overflow-hidden"
					>
						<AccordionTrigger className="hover:no-underline">
							<div className="flex items-center gap-3 w-full">
								{adverseMediaStatus === "loading"
									? getStatusIcon("loading")
									: adverseMediaStatus === "failed"
										? getStatusIcon("failed")
										: getRiskLevelIcon(adverseMediaRiskLevel)}
								<span className="font-semibold">{t("adverseMediaTitle")}</span>
								<div className="ml-auto">
									<RiskSectionBadge
										riskLevel={adverseMediaRiskLevel}
										isLoading={adverseMediaStatus === "loading"}
										isFailed={adverseMediaStatus === "failed"}
									/>
								</div>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							{adverseMediaStatus === "loading" ? (
								<p className="text-muted-foreground text-sm">
									{progressMessages?.adverseMedia ?? t("analyzingAdverseMedia")}
								</p>
							) : adverseMediaStatus === "failed" ? (
								<Alert variant="destructive" className="py-2">
									<AlertDescription className="text-xs">
										{(adverseMediaRaw as ErrorResult)?.error ??
											t("adverseMediaError")}
									</AlertDescription>
								</Alert>
							) : (
								<div className="space-y-2 text-sm">
									{!adverseMediaHasRisk && (
										<p className="text-green-600 text-sm">
											{t("noAdverseMedia")}
										</p>
									)}
									{adverseMediaRaw && !("error" in adverseMediaRaw) && (
										<div className="flex items-center gap-2">
											<span className="font-medium">{t("riskLevel")}</span>
											<Badge
												className={getRiskLevelBadgeColor(
													(adverseMediaRaw as AdverseMediaResult).risk_level,
												)}
											>
												{adverseMediaRiskLevelLabel(
													(adverseMediaRaw as AdverseMediaResult).risk_level,
												)}
											</Badge>
										</div>
									)}
									{adverseMediaRaw &&
										!("error" in adverseMediaRaw) &&
										(adverseMediaRaw as AdverseMediaResult).findings && (
											<p className="text-muted-foreground">
												{getBilingualText(
													(adverseMediaRaw as AdverseMediaResult).findings,
													language as "es" | "en",
												)}
											</p>
										)}
									{adverseMediaRaw &&
										!("error" in adverseMediaRaw) &&
										(adverseMediaRaw as AdverseMediaResult).sources &&
										(adverseMediaRaw as AdverseMediaResult).sources!.length >
											0 && (
											<div>
												<p className="font-medium mb-1">{t("sources")}</p>
												<ul className="list-disc list-inside space-y-1 text-muted-foreground">
													{(adverseMediaRaw as AdverseMediaResult).sources!.map(
														(src, i) => {
															const isLink = looksLikeUrl(src);
															const href = isLink ? ensureProtocol(src) : null;
															return (
																<li key={i} className="text-xs truncate">
																	{isLink && href ? (
																		<a
																			href={href}
																			onClick={(e) =>
																				extLink.handleExternalLink(href, e)
																			}
																			className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer underline underline-offset-2"
																		>
																			<Favicon
																				url={src}
																				className="h-3 w-3 shrink-0 inline"
																			/>
																			{extractHostname(src)}
																			<ExternalLink className="h-2.5 w-2.5 shrink-0 inline" />
																		</a>
																	) : (
																		src
																	)}
																</li>
															);
														},
													)}
												</ul>
											</div>
										)}
								</div>
							)}
						</AccordionContent>
					</AccordionItem>
				)}
			</Accordion>

			<ExternalLinkDialog
				open={extLink.isOpen}
				url={extLink.pendingUrl}
				onConfirm={extLink.confirm}
				onCancel={extLink.cancel}
			/>
		</div>
	);
}
