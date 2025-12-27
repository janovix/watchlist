"use client";

import {
	AlertCircle,
	CheckCircle,
	Search,
	Calendar,
	Database,
	Globe,
	User,
	Clock,
	Download,
	Briefcase,
	Info,
} from "lucide-react";
import type { PEPResult } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { getLocaleForLanguage, translations } from "@/lib/translations";
import { exportResultToPdf } from "@/lib/pdf-export";

interface ResultViewProps {
	result: PEPResult;
	onNewSearch: () => void;
}

function formatDate(dateString: string | null, locale: string): string {
	if (!dateString) return "—";
	try {
		return new Date(dateString).toLocaleDateString(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return dateString;
	}
}

function formatDateTime(dateString: string | null, locale: string): string {
	if (!dateString) return "—";
	try {
		return new Date(dateString).toLocaleString(locale, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateString;
	}
}

export function ResultView({ result, onNewSearch }: ResultViewProps) {
	const { t, language } = useLanguage();
	const locale = getLocaleForLanguage(language);
	const isPep = result.isPep;
	const record = result.record;

	const resultInfo = isPep
		? {
				label: t("isPep"),
				description: t("isPepDescription"),
				color: "text-red-700 dark:text-red-300",
				bgColor: "bg-red-100 dark:bg-red-950/50",
				borderColor: "border-red-300 dark:border-red-900",
				descriptionColor: "text-red-600 dark:text-red-400/90",
				icon: <AlertCircle className="h-8 w-8" />,
			}
		: {
				label: t("isNotPep"),
				description: t("isNotPepDescription"),
				color: "text-green-700 dark:text-green-300",
				bgColor: "bg-green-100 dark:bg-green-950/50",
				borderColor: "border-green-300 dark:border-green-900",
				descriptionColor: "text-green-600 dark:text-green-400/90",
				icon: <CheckCircle className="h-8 w-8" />,
			};

	return (
		<div className="w-full max-w-3xl mx-auto space-y-6">
			{/* Result Header */}
			<div
				className={`${resultInfo.bgColor} ${resultInfo.borderColor} border-2 rounded-lg p-6`}
			>
				<div className="flex items-center gap-4">
					<div className={`${resultInfo.color}`}>{resultInfo.icon}</div>
					<div className="flex-1">
						<h2 className={`text-xl font-semibold mb-1 ${resultInfo.color}`}>
							{resultInfo.label}
						</h2>
						<p className={resultInfo.descriptionColor}>
							{resultInfo.description}
						</p>
					</div>
				</div>
			</div>

			{/* Search Info */}
			<div className="bg-card border border-border rounded-lg">
				<div className="px-6 py-4 border-b border-border">
					<h3 className="text-base font-medium text-muted-foreground">
						{t("searchInfo")}
					</h3>
				</div>
				<div className="p-6 space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">{t("searchedName")}</span>
							<p className="font-medium text-foreground">{result.searchName}</p>
						</div>
						<div>
							<span className="text-muted-foreground">{t("queryDate")}</span>
							<p className="font-mono text-foreground">
								{result.timestamp.toLocaleString(locale)}
							</p>
						</div>
						<div className="md:col-span-2">
							<span className="text-muted-foreground">{t("queryId")}</span>
							<p className="font-mono text-foreground text-xs">{result.id}</p>
						</div>
					</div>
				</div>
			</div>

			{/* PEP Record Details - Only shown if isPep */}
			{isPep && record && (
				<div className="bg-card border border-border rounded-lg">
					<div className="px-6 py-4 border-b border-border">
						<h3 className="text-base font-medium text-muted-foreground">
							{t("pepRecordDetails")}
						</h3>
					</div>
					<div className="p-6 space-y-4">
						{/* Dataset & ID */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-start gap-3">
								<Database className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<span className="text-sm text-muted-foreground">
										{t("dataset")}
									</span>
									<p className="font-medium text-foreground">
										{record.dataset}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<span className="h-5 w-5 text-primary mt-0.5 font-mono text-xs flex items-center justify-center">
									#
								</span>
								<div>
									<span className="text-sm text-muted-foreground">
										{t("recordId")}
									</span>
									<p className="font-mono text-foreground text-sm">
										{record.id}
									</p>
								</div>
							</div>
						</div>

						{/* Name */}
						<div className="flex items-start gap-3">
							<User className="h-5 w-5 text-primary mt-0.5" />
							<div>
								<span className="text-sm text-muted-foreground">
									{t("registeredName")}
								</span>
								<p className="font-medium text-foreground">{record.name}</p>
							</div>
						</div>

						{/* Aliases */}
						<div className="flex items-start gap-3">
							<User className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<span className="text-sm text-muted-foreground">
									{t("aliases")}
								</span>
								{record.aliases.length > 0 ? (
									<div className="flex flex-wrap gap-2 mt-1">
										{record.aliases.map((alias, idx) => (
											<span
												key={idx}
												className="px-2 py-1 bg-secondary rounded text-sm text-foreground"
											>
												{alias}
											</span>
										))}
									</div>
								) : (
									<p className="text-muted-foreground italic">
										{t("noAliases")}
									</p>
								)}
							</div>
						</div>

						{/* Birth Date */}
						<div className="flex items-start gap-3">
							<Calendar className="h-5 w-5 text-primary mt-0.5" />
							<div>
								<span className="text-sm text-muted-foreground">
									{t("birthDate")}
								</span>
								<p className="font-medium text-foreground">
									{formatDate(record.birthDate, locale)}
								</p>
							</div>
						</div>

						{/* Countries */}
						<div className="flex items-start gap-3">
							<Globe className="h-5 w-5 text-primary mt-0.5" />
							<div>
								<span className="text-sm text-muted-foreground">
									{t("countries")}
								</span>
								{record.countries.length > 0 ? (
									<div className="flex flex-wrap gap-2 mt-1">
										{record.countries.map((country, idx) => (
											<span
												key={idx}
												className="px-2 py-1 bg-primary/10 rounded text-sm font-medium text-primary"
											>
												{country}
											</span>
										))}
									</div>
								) : (
									<p className="text-muted-foreground italic">
										{t("noCountries")}
									</p>
								)}
							</div>
						</div>

						{/* Current Position */}
						{result.currentPosition && (
							<div className="flex items-start gap-3">
								<Briefcase className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<span className="text-sm text-muted-foreground">
										{t("currentPosition")}
									</span>
									<p className="font-medium text-foreground">
										{result.currentPosition}
									</p>
								</div>
							</div>
						)}

						{/* Confidence */}
						<div className="flex items-start gap-3">
							<span className="h-5 w-5 text-primary mt-0.5 font-mono text-xs flex items-center justify-center">
								%
							</span>
							<div>
								<span className="text-sm text-muted-foreground">
									{t("confidence")}
								</span>
								<p className="font-medium text-foreground">
									{result.confidence === "high"
										? t("confidenceHigh")
										: result.confidence === "medium"
											? t("confidenceMedium")
											: result.confidence === "low"
												? t("confidenceLow")
												: t("confidenceRequiresVerification")}
								</p>
							</div>
						</div>

						{/* Source */}
						<div className="flex items-start gap-3">
							<Search className="h-5 w-5 text-primary mt-0.5" />
							<div>
								<span className="text-sm text-muted-foreground">
									{t("source")}
								</span>
								<p className="font-medium text-foreground">
									{result.source === "ai"
										? t("sourceAi")
										: result.source === "watchlist"
											? t("sourceWatchlist")
											: t("sourceGk")}
								</p>
							</div>
						</div>

						{/* Evidence */}
						{result.evidence && result.evidence.length > 0 && (
							<div className="flex items-start gap-3">
								<Info className="h-5 w-5 text-primary mt-0.5" />
								<div>
									<span className="text-sm text-muted-foreground">
										{t("evidence")}
									</span>
									<ul className="list-disc list-inside text-foreground text-sm mt-1">
										{result.evidence.map((item, idx) => (
											<li key={idx}>{item}</li>
										))}
									</ul>
								</div>
							</div>
						)}

						{/* Reasoning */}
						{result.reasoning && (
							<div className="flex items-start gap-3">
								<span className="h-5 w-5 text-primary mt-0.5 font-mono text-xs flex items-center justify-center">
									🧠
								</span>
								<div>
									<span className="text-sm text-muted-foreground">
										{t("reasoning")}
									</span>
									<p className="text-foreground text-sm mt-1">
										{result.reasoning}
									</p>
								</div>
							</div>
						)}

						{/* Timestamps */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
							<div className="flex items-start gap-3">
								<Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<span className="text-xs text-muted-foreground">
										{t("firstSeen")}
									</span>
									<p className="text-sm text-foreground">
										{formatDateTime(record.firstSeen, locale)}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<span className="text-xs text-muted-foreground">
										{t("lastChange")}
									</span>
									<p className="text-sm text-foreground">
										{formatDateTime(record.lastChange, locale)}
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<span className="text-xs text-muted-foreground">
										{t("lastSeen")}
									</span>
									<p className="text-sm text-foreground">
										{formatDateTime(record.lastSeen, locale)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex gap-4 justify-center pt-4">
				<Button
					onClick={onNewSearch}
					className="bg-primary hover:bg-primary/90"
				>
					<Search className="mr-2 h-4 w-4" />
					{t("newSearch")}
				</Button>
				<Button
					onClick={() => {
						exportResultToPdf(result, translations[language], locale);
					}}
					variant="outline"
				>
					<Download className="mr-2 h-4 w-4" />
					{t("exportPdf")}
				</Button>
			</div>
		</div>
	);
}
