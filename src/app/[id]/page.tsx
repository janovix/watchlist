"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadingView } from "@/components/loading-view";
import { ResultView } from "@/components/result-view";
import { Header } from "@/components/header";
import { Logo } from "@/components/logo";
import { LanguageProvider, useLanguage } from "@/components/language-provider";
import { type PEPResult } from "@/lib/mock-data";
import { searchPep } from "@/lib/api/pep";

type ViewState = "loading" | "result" | "not-found";

function QueryContent() {
	const params = useParams();
	const router = useRouter();
	const queryId = params.id as string;
	const [viewState, setViewState] = useState<ViewState>("loading");
	const [currentResult, setCurrentResult] = useState<PEPResult | null>(null);
	const [searchName, setSearchName] = useState("");
	const { t } = useLanguage();

	useEffect(() => {
		// Try to load from sessionStorage first
		const loadFromStorage = () => {
			try {
				const stored = sessionStorage.getItem("pep-recent-searches");
				if (stored) {
					const parsed = JSON.parse(stored);
					const restored = parsed.map((s: PEPResult) => ({
						...s,
						timestamp: new Date(s.timestamp),
					}));
					const found = restored.find((s: PEPResult) => s.id === queryId);
					if (found) {
						setCurrentResult(found);
						setSearchName(found.searchName);
						setViewState("result");
						return true;
					}
				}
			} catch (e) {
				console.log("[v0] Error loading from storage:", e);
			}
			return false;
		};

		// Check if we have a pending search in sessionStorage
		const loadPendingSearch = () => {
			try {
				const pending = sessionStorage.getItem(`pep-pending-${queryId}`);
				if (pending) {
					const { searchName: name } = JSON.parse(pending);
					setSearchName(name);
					return name;
				}
			} catch (e) {
				console.log("[v0] Error loading pending search:", e);
			}
			return null;
		};

		// First, try to load completed result from storage
		if (loadFromStorage()) {
			return;
		}

		// If not found, check for pending search
		const pendingName = loadPendingSearch();
		if (pendingName) {
			// Call the actual PEP search API
			searchPep(pendingName)
				.then((apiResult) => {
					// Transform API response to PEPResult format
					const result: PEPResult = {
						id: queryId,
						searchName: pendingName,
						isPep: apiResult.isPep,
						timestamp: new Date(),
						record: apiResult.record,
					};

					setCurrentResult(result);
					setViewState("result");

					// Save to recent searches
					try {
						const stored = sessionStorage.getItem("pep-recent-searches");
						const existing = stored ? JSON.parse(stored) : [];
						const restored: PEPResult[] = existing.map((s: PEPResult) => ({
							...s,
							timestamp: new Date(s.timestamp),
						}));
						const filtered = restored.filter((s) => s.id !== queryId);
						const updated = [result, ...filtered].slice(0, 10);
						sessionStorage.setItem(
							"pep-recent-searches",
							JSON.stringify(updated),
						);
					} catch (e) {
						console.log("[v0] Error saving result:", e);
					}

					// Remove pending flag
					sessionStorage.removeItem(`pep-pending-${queryId}`);
				})
				.catch((e) => {
					console.log("[v0] Error searching PEP:", e);
					setViewState("not-found");
				});
		} else {
			// No pending search and no result found - 404
			setViewState("not-found");
		}
	}, [queryId]);

	const handleNewSearch = () => {
		router.push("/");
	};

	if (viewState === "not-found") {
		return (
			<main className="min-h-screen bg-background flex flex-col">
				<Header />
				<div className="flex-1 flex items-center justify-center min-h-[calc(100vh-81px)] py-10 px-4">
					<div className="text-center">
						<h2 className="text-2xl font-semibold text-foreground mb-2">
							Query Not Found
						</h2>
						<p className="text-muted-foreground mb-4">
							The query you're looking for doesn't exist or has expired.
						</p>
						<button
							onClick={handleNewSearch}
							className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
						>
							{t("newSearch")}
						</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-background flex flex-col">
			<Header />

			{/* Main Content */}
			{viewState === "loading" ? (
				<div className="flex-1 flex items-center justify-center min-h-[calc(100vh-81px)] py-10 px-4">
					<div className="w-full max-w-2xl mx-auto">
						<LoadingView searchName={searchName} />
					</div>
				</div>
			) : (
				<div className="flex-1 flex items-center py-10">
					<div className="container mx-auto px-4 w-full">
						{currentResult && (
							<div className="py-4">
								<ResultView
									result={currentResult}
									onNewSearch={handleNewSearch}
								/>
							</div>
						)}
					</div>
				</div>
			)}
		</main>
	);
}

export default function QueryPage() {
	return (
		<LanguageProvider>
			<QueryContent />
		</LanguageProvider>
	);
}
