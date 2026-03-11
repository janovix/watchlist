"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/language-provider";
import type {
	OfacMatch,
	UnscMatch,
	Sat69bMatch,
	OfacTarget,
	UnscTarget,
	Sat69bTarget,
} from "@/lib/api/watchlist-search";

type WatchlistMatch = OfacMatch | UnscMatch | Sat69bMatch;

interface MatchResultsListProps {
	matches: WatchlistMatch[];
}

function getRiskLevel(score: number): "high" | "medium" | "low" {
	if (score > 0.75) return "high";
	if (score > 0.5) return "medium";
	return "low";
}

function getMatchBadgeVariant(
	level: "high" | "medium" | "low",
): "destructive" | "default" | "secondary" {
	if (level === "high") return "destructive";
	if (level === "medium") return "default";
	return "secondary";
}

// Helper functions para determinar el tipo de target
function isOfacTarget(
	target: OfacTarget | UnscTarget | Sat69bTarget,
): target is OfacTarget {
	return "sourceList" in target;
}

function isUnscTarget(
	target: OfacTarget | UnscTarget | Sat69bTarget,
): target is UnscTarget {
	return "unListType" in target;
}

function isSat69bTarget(
	target: OfacTarget | UnscTarget | Sat69bTarget,
): target is Sat69bTarget {
	return "rfc" in target;
}

// Helper para obtener el nombre primario
function getPrimaryName(
	target: OfacTarget | UnscTarget | Sat69bTarget,
): string {
	if (isSat69bTarget(target)) {
		return target.taxpayerName;
	}
	return target.primaryName;
}

// Helper para obtener aliases
function getAliases(
	target: OfacTarget | UnscTarget | Sat69bTarget,
): string[] | null {
	if (isSat69bTarget(target)) {
		return null;
	}
	return target.aliases;
}

// Helper para obtener dataset label
function getDatasetLabel(
	target: OfacTarget | UnscTarget | Sat69bTarget,
): string {
	if (isOfacTarget(target)) return "OFAC";
	if (isUnscTarget(target)) return "UNSC";
	if (isSat69bTarget(target)) return "SAT 69-B";
	return "Unknown";
}

interface MatchCardProps {
	match: WatchlistMatch;
}

function MatchCard({ match }: MatchCardProps) {
	const [expanded, setExpanded] = useState(false);
	const { t } = useLanguage();
	const matchLevel = getRiskLevel(match.score);
	const badgeVariant = getMatchBadgeVariant(matchLevel);

	const matchLabel =
		matchLevel === "high"
			? t("highMatch")
			: matchLevel === "medium"
				? t("mediumMatch")
				: t("lowMatch");

	const primaryName = getPrimaryName(match.target);
	const aliases = getAliases(match.target);
	const datasetLabel = getDatasetLabel(match.target);

	return (
		<Card className="p-4 sm:p-6 hover:shadow-md transition-shadow border-dashed">
			<div className="flex items-start gap-3 sm:gap-4">
				<div className="shrink-0 mt-1">
					<div
						className={`p-2 rounded-lg ${
							matchLevel === "high"
								? "bg-destructive/10"
								: matchLevel === "medium"
									? "bg-amber-500/10"
									: "bg-green-500/10"
						}`}
					>
						<Shield
							className={`h-5 w-5 ${
								matchLevel === "high"
									? "text-destructive"
									: matchLevel === "medium"
										? "text-amber-500"
										: "text-green-500"
							}`}
						/>
					</div>
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-base sm:text-lg truncate">
								{primaryName || t("unknownName")}
							</h3>
						</div>
						<div className="flex items-center gap-2 flex-shrink-0">
							<Badge variant="outline" className="text-xs">
								{datasetLabel}
							</Badge>
							<Badge variant={badgeVariant} className="text-xs">
								{matchLabel}
							</Badge>
						</div>
					</div>

					{aliases && aliases.length > 0 && (
						<div className="text-sm text-muted-foreground mb-2">
							<span className="font-medium">{t("aliases")}: </span>
							{aliases.slice(0, 2).join(", ")}
							{aliases.length > 2 && ` +${aliases.length - 2}`}
						</div>
					)}

					<div className="space-y-2 mb-3">
						<p className="text-sm font-medium">{t("scoreBreakdown")}</p>
						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{t("nameScore")} (55%)</span>
								<span>{(match.breakdown.nameScore * 100).toFixed(0)}%</span>
							</div>
							<Progress
								value={match.breakdown.nameScore * 100}
								className="h-2"
							/>
						</div>
						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{t("vectorScore")} (35%)</span>
								<span>{(match.breakdown.vectorScore * 100).toFixed(0)}%</span>
							</div>
							<Progress
								value={match.breakdown.vectorScore * 100}
								className="h-2"
							/>
						</div>
						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{t("metaScore")} (10%)</span>
								<span>{(match.breakdown.metaScore * 100).toFixed(0)}%</span>
							</div>
							<Progress
								value={match.breakdown.metaScore * 100}
								className="h-2"
							/>
						</div>
					</div>

					<Button
						variant="ghost"
						size="sm"
						onClick={() => setExpanded(!expanded)}
						className="text-xs"
					>
						{expanded ? (
							<>
								<ChevronUp className="h-4 w-4 mr-1" />
								{t("hideDetails")}
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4 mr-1" />
								{t("showDetails")}
							</>
						)}
					</Button>

					{expanded && (
						<div className="mt-4 pt-4 border-t space-y-3 text-sm">
							{!isSat69bTarget(match.target) && match.target.birthDate && (
								<div>
									<span className="font-medium">{t("birthDate")}: </span>
									<span className="text-muted-foreground">
										{match.target.birthDate.includes("T")
											? match.target.birthDate.slice(0, 10)
											: match.target.birthDate}
									</span>
								</div>
							)}

							{isUnscTarget(match.target) &&
								match.target.nationalities &&
								match.target.nationalities.length > 0 && (
									<div>
										<span className="font-medium">{t("countries")}: </span>
										<span className="text-muted-foreground">
											{match.target.nationalities.join(", ")}
										</span>
									</div>
								)}

							{!isSat69bTarget(match.target) &&
								match.target.identifiers &&
								match.target.identifiers.length > 0 && (
									<div>
										<span className="font-medium">{t("identifiers")}: </span>
										<div className="mt-1 space-y-1">
											{match.target.identifiers.map((id, idx) => (
												<div key={idx} className="text-muted-foreground ml-4">
													{id.type && `${id.type}: `}
													{id.number}
													{id.country && ` (${id.country})`}
												</div>
											))}
										</div>
									</div>
								)}

							{!isSat69bTarget(match.target) &&
								match.target.addresses &&
								match.target.addresses.length > 0 && (
									<div>
										<span className="font-medium">{t("addresses")}: </span>
										<span className="text-muted-foreground">
											{match.target.addresses.join("; ")}
										</span>
									</div>
								)}

							{isUnscTarget(match.target) &&
								match.target.designations &&
								match.target.designations.length > 0 && (
									<div>
										<span className="font-medium">{t("sanctions")}: </span>
										<span className="text-muted-foreground">
											{match.target.designations.join(", ")}
										</span>
									</div>
								)}

							{isSat69bTarget(match.target) && (
								<>
									<div>
										<span className="font-medium">RFC: </span>
										<span className="text-muted-foreground">
											{match.target.rfc}
										</span>
									</div>
									<div>
										<span className="font-medium">{t("taxpayerStatus")}: </span>
										<span className="text-muted-foreground">
											{match.target.taxpayerStatus}
										</span>
									</div>
								</>
							)}

							<div>
								<span className="font-medium">{t("recordId")}: </span>
								<span className="text-muted-foreground font-mono text-xs">
									{match.target.id}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}

export function MatchResultsList({ matches }: MatchResultsListProps) {
	const { t } = useLanguage();

	if (matches.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
					<Shield className="h-8 w-8 text-green-500" />
				</div>
				<h2 className="text-2xl font-bold mb-2">{t("noMatchesFound")}</h2>
				<p className="text-muted-foreground max-w-md mx-auto">
					{t("noMatchesDescription")}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{matches.map((match, index) => (
				<MatchCard key={`${match.target.id}-${index}`} match={match} />
			))}
		</div>
	);
}
