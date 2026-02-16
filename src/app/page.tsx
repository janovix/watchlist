"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Settings2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TypeSwitch } from "@/components/type-switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import {
	searchWatchlist,
	type WatchlistSearchRequest,
} from "@/lib/api/watchlist-search";
import { useJwt } from "@/hooks/useJwt";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import { NoWatchlistAccess } from "@/components/subscription";

export default function HomePage() {
	const router = useRouter();
	const { t } = useLanguage();
	const [searchType, setSearchType] = useState<"individual" | "company">(
		"individual",
	);
	const [query, setQuery] = useState("");
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [birthDate, setBirthDate] = useState("");
	const [identifiers, setIdentifiers] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const { jwt, isLoading: jwtLoading } = useJwt();
	const subscription = useSubscriptionSafe();

	// Check watchlist product access
	if (subscription?.isLoading) {
		return <NoWatchlistAccess isLoading />;
	}

	if (subscription && !hasWatchlistAccess(subscription.subscription)) {
		return <NoWatchlistAccess />;
	}

	const handleSearch = async () => {
		if (!query.trim() || isSearching) return;

		setIsSearching(true);

		try {
			// Map individual/company to person/organization for API
			const entityType =
				searchType === "individual" ? "person" : "organization";

			const searchParams: WatchlistSearchRequest = {
				q: query.trim(),
				entityType,
			};

			// Add optional fields if provided
			if (birthDate.trim()) {
				searchParams.birthDate = birthDate.trim();
			}

			if (identifiers.trim()) {
				searchParams.identifiers = identifiers
					.split(",")
					.map((id) => id.trim())
					.filter((id) => id.length > 0);
			}

			// Perform the search
			const response = await searchWatchlist(searchParams, {
				jwt: jwt || "",
			});

			// Get queryId from response
			const queryId = response.result.queryId;

			// Store search params and response in sessionStorage for the result page
			sessionStorage.setItem(
				`watchlist-pending-${queryId}`,
				JSON.stringify({ searchParams }),
			);
			sessionStorage.setItem(
				`watchlist-result-${queryId}`,
				JSON.stringify(response),
			);

			// Navigate to result page
			router.push(`/queries/${queryId}`);
		} catch (error) {
			console.error("Search error:", error);
			setIsSearching(false);
			// TODO: Show error toast
		}
	};

	const canSubmit = query.trim().length > 3 && !isSearching;

	return (
		<main className="h-screen flex flex-col px-3 sm:px-6 md:px-8 pt-16 overflow-hidden">
			<div className="flex-1 flex items-center justify-center min-h-0">
				<div className="w-full max-w-3xl space-y-4">
					{/* Info Card */}
					<div className="flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border">
						<div className="min-w-0">
							<p className="text-sm font-mono text-muted-foreground">
								Watchlist v1.0.0
							</p>
							<p className="text-foreground text-sm sm:text-base mt-1">
								Search for an individual or company to run a background
								screening.
							</p>
						</div>
					</div>

					{/* Search Input */}
					<div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl bg-background border-2 border-primary/30 shadow-lg">
						{/* Entity Type Toggle */}
						<TypeSwitch
							compact
							checked={searchType === "company"}
							onCheckedChange={(checked) =>
								setSearchType(checked ? "company" : "individual")
							}
						/>

						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value.toUpperCase())}
							onKeyDown={(e) =>
								e.key === "Enter" && canSubmit && handleSearch()
							}
							placeholder={
								searchType === "individual"
									? "SEARCH INDIVIDUAL..."
									: "SEARCH COMPANY..."
							}
							className="flex-1 border-0 bg-transparent text-base sm:text-lg focus-visible:ring-0 focus-visible:ring-offset-0 uppercase font-mono min-w-0"
						/>

						{/* Settings Button */}
						<Button
							onClick={() => setAdvancedOpen(!advancedOpen)}
							variant="ghost"
							size="icon"
							className="shrink-0 rounded-full h-10 w-10 p-0 flex items-center justify-center"
						>
							<Settings2 className="h-5 w-5" />
						</Button>

						{/* Submit Button */}
						<Button
							onClick={handleSearch}
							disabled={!canSubmit}
							size="icon"
							className="shrink-0 rounded-full h-10 w-10 p-0 flex items-center justify-center"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>

					{/* Advanced Settings - animated expand/collapse */}
					<div
						className="grid transition-[grid-template-rows] duration-300 ease-in-out"
						style={{ gridTemplateRows: advancedOpen ? "1fr" : "0fr" }}
					>
						<div className="overflow-hidden">
							<div
								className="transition-opacity duration-300 ease-in-out"
								style={{ opacity: advancedOpen ? 1 : 0 }}
							>
								<div className="space-y-6 p-4 sm:p-6 rounded-2xl bg-background/70 backdrop-blur-sm border-2 border-muted">
									{/* Identifiers */}
									<div className="space-y-2">
										<Label className="text-base">
											Identifiers (comma-separated)
										</Label>
										<Input
											value={identifiers}
											onChange={(e) => setIdentifiers(e.target.value)}
											placeholder="RFC, CURP, etc."
											className="bg-background/50 backdrop-blur-sm"
										/>
									</div>

									{/* Birth Date / Date of Creation */}
									<div className="space-y-2">
										<Label className="text-base">
											{searchType === "individual"
												? "Birth Date (YYYY-MM-DD)"
												: "Date of Creation (YYYY-MM-DD)"}
										</Label>
										<Input
											value={birthDate}
											onChange={(e) => setBirthDate(e.target.value)}
											placeholder="YYYY-MM-DD"
											className="bg-background/50 backdrop-blur-sm"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="w-full py-4">
				<div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2 opacity-80">
						<Logo variant="logo" width={80} height={14} />
					</div>
					<div className="flex items-center gap-4">
						<span>&copy; {new Date().getFullYear()} Janovix</span>
						<a
							href="https://janovix.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							Privacy
						</a>
						<a
							href="https://janovix.com/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							Terms
						</a>
					</div>
				</div>
			</footer>
		</main>
	);
}
