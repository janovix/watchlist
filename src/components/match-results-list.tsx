"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/components/language-provider";
import type { WatchlistMatch } from "@/lib/api/watchlist-search";

interface MatchResultsListProps {
	matches: WatchlistMatch[];
}

function getRiskLevel(score: number): "high" | "medium" | "low" {
	if (score >= 0.95) return "high";
	if (score >= 0.8) return "medium";
	return "low";
}

function getRiskBadgeVariant(
	level: "high" | "medium" | "low",
): "destructive" | "default" | "secondary" {
	if (level === "high") return "destructive";
	if (level === "medium") return "default";
	return "secondary";
}

interface MatchCardProps {
	match: WatchlistMatch;
}

function MatchCard({ match }: MatchCardProps) {
	const [expanded, setExpanded] = useState(false);
	const { t } = useLanguage();
	const riskLevel = getRiskLevel(match.score);
	const badgeVariant = getRiskBadgeVariant(riskLevel);

	const riskLabel =
		riskLevel === "high"
			? t("highRisk")
			: riskLevel === "medium"
				? t("mediumRisk")
				: t("lowRisk");

	return (
		<Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
			<div className="flex items-start gap-3 sm:gap-4">
				{/* Risk Icon */}
				<div className="shrink-0 mt-1">
					<div
						className={`p-2 rounded-lg ${
							riskLevel === "high"
								? "bg-destructive/10"
								: riskLevel === "medium"
									? "bg-amber-500/10"
									: "bg-green-500/10"
						}`}
					>
						<Shield
							className={`h-5 w-5 ${
								riskLevel === "high"
									? "text-destructive"
									: riskLevel === "medium"
										? "text-amber-500"
										: "text-green-500"
							}`}
						/>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
						<div className="flex items-center gap-2 flex-wrap">
							<h3 className="font-semibold text-lg truncate">
								{match.target.name || "Unknown"}
							</h3>
							<Badge variant={badgeVariant} className="shrink-0">
								{riskLabel} - {(match.score * 100).toFixed(0)}%
							</Badge>
							{match.breakdown.identifierMatch && (
								<Badge variant="outline" className="shrink-0 bg-primary/10">
									<AlertCircle className="h-3 w-3 mr-1" />
									{t("identifierMatch")}
								</Badge>
							)}
						</div>
					</div>

					{/* Metadata */}
					<div className="text-sm text-muted-foreground space-y-1 mb-3">
						{match.target.dataset && (
							<p>
								<span className="font-medium">Dataset:</span>{" "}
								{match.target.dataset}
							</p>
						)}
						{match.target.aliases && match.target.aliases.length > 0 && (
							<p>
								<span className="font-medium">Aliases:</span>{" "}
								{match.target.aliases.join(", ")}
							</p>
						)}
					</div>

					{/* Score Breakdown */}
					<div className="space-y-2 mb-3">
						<p className="text-sm font-medium">{t("scoreBreakdown")}</p>

						{/* Vector Score - 55% weight */}
						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{t("vectorScore")} (55%)</span>
								<span>{(match.breakdown.vectorScore * 100).toFixed(0)}%</span>
							</div>
							<Progress
								value={match.breakdown.vectorScore * 100}
								className="h-2"
							/>
						</div>

						{/* Name Score - 35% weight */}
						<div className="space-y-1">
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{t("nameScore")} (35%)</span>
								<span>{(match.breakdown.nameScore * 100).toFixed(0)}%</span>
							</div>
							<Progress
								value={match.breakdown.nameScore * 100}
								className="h-2"
							/>
						</div>

						{/* Meta Score - 10% weight */}
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

					{/* Expand/Collapse Button */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setExpanded(!expanded)}
						className="w-full justify-center"
					>
						{expanded ? (
							<>
								<ChevronUp className="h-4 w-4 mr-2" />
								{t("hideDetails")}
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4 mr-2" />
								{t("viewDetails")}
							</>
						)}
					</Button>

					{/* Expanded Details */}
					{expanded && (
						<div className="mt-4 pt-4 border-t border-border space-y-3 text-sm">
							<h4 className="font-medium">{t("matchDetails")}</h4>

							{match.target.birthDate && (
								<div>
									<span className="font-medium">{t("birthDateLabel")}:</span>{" "}
									{match.target.birthDate}
								</div>
							)}

							{match.target.countries && match.target.countries.length > 0 && (
								<div>
									<span className="font-medium">{t("countriesLabel")}:</span>{" "}
									{match.target.countries.join(", ")}
								</div>
							)}

							{match.target.identifiers &&
								match.target.identifiers.length > 0 && (
									<div>
										<span className="font-medium">
											{t("identifiersLabel")}:
										</span>{" "}
										{match.target.identifiers.join(", ")}
									</div>
								)}

							{match.target.addresses && match.target.addresses.length > 0 && (
								<div>
									<span className="font-medium">Addresses:</span>{" "}
									{match.target.addresses.join(", ")}
								</div>
							)}

							{match.target.sanctions && match.target.sanctions.length > 0 && (
								<div>
									<span className="font-medium">Sanctions:</span>{" "}
									{match.target.sanctions.join(", ")}
								</div>
							)}

							<div>
								<span className="font-medium">Record ID:</span>{" "}
								{match.target.id}
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

	// Find highest score for display
	const highestScore = Math.max(...matches.map((m) => m.score));

	return (
		<div className="space-y-6">
			{/* Summary Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-border">
				<p className="text-lg font-semibold">
					{t("matchesFound").replace("{count}", matches.length.toString())}
				</p>
				<p className="text-sm text-muted-foreground">
					{t("highestScore")}{" "}
					<span className="font-bold text-foreground">
						{(highestScore * 100).toFixed(0)}%
					</span>
				</p>
			</div>

			{/* Matches List */}
			<div className="space-y-4">
				{matches.map((match, index) => (
					<MatchCard key={`${match.target.id}-${index}`} match={match} />
				))}
			</div>
		</div>
	);
}
