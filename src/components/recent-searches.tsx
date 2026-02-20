"use client";

import { Clock, Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "./ui/button";
import Link from "next/link";

interface RecentSearch {
	id: string;
	name: string;
	entityType: "person" | "organization";
	date: string;
}

interface RecentSearchesProps {
	searches: RecentSearch[];
	onSelect: (search: RecentSearch) => void;
	onFocusSearch: () => void;
}

export function RecentSearches({
	searches,
	onSelect,
	onFocusSearch,
}: RecentSearchesProps) {
	const { t } = useLanguage();

	return (
		<div className="overflow-hidden rounded-xl border border-border animate-fade-in-up">
			<div className="flex items-center justify-between gap-2 border-b border-border bg-card px-6 py-4">
				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium text-muted-foreground">
						{t("recentSearches")}
					</span>
				</div>
				<Link href="/queries">
					<Button variant="outline" size="sm">
						Ver todas
					</Button>
				</Link>
			</div>

			{searches.length === 0 ? (
				<div className="flex flex-col items-center justify-center bg-card px-6 py-16">
					<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
						<Search className="h-7 w-7 text-muted-foreground" />
					</div>

					<h3 className="text-balance text-lg font-semibold text-foreground">
						{t("noRecentSearches")}
					</h3>

					<p className="mt-2 text-balance text-center text-sm text-muted-foreground">
						{t("noRecentSearchesDescription")}
					</p>

					<button
						onClick={onFocusSearch}
						className="mt-6 flex items-center gap-2 rounded-lg bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/25 hover:scale-[1.02] active:scale-[0.98]"
					>
						<Search className="h-4 w-4" />
						{t("startFirstSearch")}
					</button>
				</div>
			) : (
				<div className="flex flex-col bg-card">
					{searches.map((search, i) => (
						<button
							key={`${search.id}-${i}`}
							onClick={() => onSelect(search)}
							className="flex items-center justify-between border-b border-border/50 px-6 py-3.5 text-left transition-colors duration-200 last:border-0 hover:bg-secondary/50 group"
						>
							<div className="flex items-center gap-3">
								<Search className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="text-sm text-foreground">{search.name}</span>
							</div>
							<div className="flex items-center gap-3">
								<span className="text-xs text-muted-foreground">
									{search.date}
								</span>
								<ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
