"use client";

import Link from "next/link";
import {
	Clock,
	ChevronRight,
	AlertCircle,
	CheckCircle,
	Search,
} from "lucide-react";
import type { PEPResult } from "@/lib/mock-data";
import { useLanguage } from "@/components/language-provider";
import { getLocaleForLanguage } from "@/lib/translations";
import { Button } from "@/components/ui/button";

interface RecentSearchesProps {
	searches: PEPResult[];
	onStartSearch?: () => void;
}

export function RecentSearches({
	searches,
	onStartSearch,
}: RecentSearchesProps) {
	const { t, language } = useLanguage();

	if (searches.length === 0) {
		return (
			<div className="bg-card border border-border rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-border">
					<h3 className="text-base font-medium text-muted-foreground flex items-center gap-2">
						<Clock className="h-4 w-4" />
						{t("recentSearches")}
					</h3>
				</div>
				<div className="p-8 flex flex-col items-center justify-center text-center">
					<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<Search className="h-8 w-8 text-primary" />
					</div>
					<h4 className="text-lg font-semibold text-foreground mb-2">
						{t("noRecentSearches")}
					</h4>
					<p className="text-sm text-muted-foreground mb-6 max-w-md">
						{t("noRecentSearchesDescription")}
					</p>
					{onStartSearch && (
						<Button
							onClick={onStartSearch}
							className="bg-primary hover:bg-primary/90 text-primary-foreground"
						>
							<Search className="h-4 w-4 mr-2" />
							{t("startFirstSearch")}
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-card border border-border rounded-lg">
			<div className="px-6 py-4 border-b border-border">
				<h3 className="text-base font-medium text-muted-foreground flex items-center gap-2">
					<Clock className="h-4 w-4" />
					{t("recentSearches")}
				</h3>
			</div>
			<div className="p-4 space-y-2">
				{searches.slice(0, 5).map((search) => {
					const isPep = search.isPep;

					return (
						<Link
							key={search.id}
							href={`/${search.id}`}
							className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left group"
						>
							<div
								className={
									isPep
										? "text-destructive"
										: "text-green-600 dark:text-green-400"
								}
							>
								{isPep ? (
									<AlertCircle className="h-5 w-5" />
								) : (
									<CheckCircle className="h-5 w-5" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground truncate">
									{search.searchName}
								</p>
								<p className="text-xs text-muted-foreground">
									{search.timestamp.toLocaleString(
										getLocaleForLanguage(language),
										{
											day: "2-digit",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										},
									)}
								</p>
							</div>
							<span
								className={`px-2 py-0.5 rounded border text-xs font-medium ${
									isPep
										? "border-destructive/50 text-destructive bg-destructive/10"
										: "border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10"
								}`}
							>
								{isPep ? t("yes") : t("no")}
							</span>
							<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
						</Link>
					);
				})}
			</div>
		</div>
	);
}
