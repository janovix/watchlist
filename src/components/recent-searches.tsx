"use client";

import { Clock, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import type { PEPResult } from "@/lib/mock-data";
import { useLanguage } from "@/components/language-provider";
import { getLocaleForLanguage } from "@/lib/translations";

interface RecentSearchesProps {
	searches: PEPResult[];
	onSelectSearch: (result: PEPResult) => void;
}

export function RecentSearches({
	searches,
	onSelectSearch,
}: RecentSearchesProps) {
	const { t, language } = useLanguage();

	if (searches.length === 0) {
		return null;
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
						<button
							key={search.id}
							onClick={() => onSelectSearch(search)}
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
						</button>
					);
				})}
			</div>
		</div>
	);
}
