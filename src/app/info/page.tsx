"use client";

import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	Shield,
	Database,
	Globe,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import { LAYOUT_HORIZONTAL_PAD } from "@/lib/layout";
import { cn } from "@/lib/utils";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

/** Route-level skeleton mirroring info layout (hero, cards, accordion, disclaimer block). */
export function InfoPageSkeleton() {
	return (
		<div className={cn("flex-1 py-8", LAYOUT_HORIZONTAL_PAD)}>
			<div className="mx-auto max-w-4xl">
				<Skeleton className="h-10 w-40 mb-6 rounded-md" />
				<div className="mb-10 space-y-3">
					<Skeleton className="h-10 w-full max-w-lg" />
					<Skeleton className="h-6 w-full" />
					<Skeleton className="h-6 w-3/4" />
				</div>
				<Skeleton className="h-40 w-full rounded-xl mb-10" />
				<div className="mb-10 space-y-4">
					<Skeleton className="h-7 w-48" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[0, 1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-32 w-full rounded-lg" />
						))}
					</div>
				</div>
				<div className="mb-10 space-y-3">
					<Skeleton className="h-7 w-40" />
					{[0, 1, 2].map((i) => (
						<Skeleton key={i} className="h-12 w-full rounded-md" />
					))}
				</div>
				<Skeleton className="h-36 w-full rounded-xl" />
			</div>
		</div>
	);
}

export default function InfoPage() {
	const router = useRouter();
	const { t } = useLanguage();

	const navigateBack = () => {
		router.push("/");
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<main className={cn("flex-1 py-8", LAYOUT_HORIZONTAL_PAD)}>
				<div className="mx-auto max-w-4xl">
					{/* Header */}
					<Button variant="ghost" onClick={navigateBack} className="mb-6 -ml-2">
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("backToHome")}
					</Button>

					<div className="mb-10">
						<h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
							{t("aboutWatchlist")}
						</h1>
						<p className="text-muted-foreground text-lg text-pretty">
							{t("aboutWatchlistDescription")}
						</p>
					</div>

					{/* What is Watchlist */}
					<section className="mb-10 p-6 rounded-xl bg-card/80 backdrop-blur-sm border">
						<div className="flex items-start gap-4 mb-4">
							<div className="p-2 rounded-lg bg-primary/10">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h2 className="text-xl font-semibold mb-2">
									{t("whatIsWatchlist")}
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t("whatIsWatchlistDescription")}
								</p>
							</div>
						</div>
					</section>

					{/* Data Sources */}
					<section className="mb-10">
						<div className="flex items-center gap-3 mb-5">
							<Database className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold">{t("dataSources")}</h2>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
								<h3 className="font-semibold mb-2">OFAC SDN List</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t("ofacSdnDescription")}
								</p>
							</div>
							<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
								<h3 className="font-semibold mb-2">SAT 69-B (EFOS)</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t("sat69bDescription")}
								</p>
							</div>
							<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
								<h3 className="font-semibold mb-2">{t("unSanctionsList")}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t("unSanctionsDescription")}
								</p>
							</div>
							<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
								<h3 className="font-semibold mb-2">PEP Database</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t("pepDatabaseDescription")}
								</p>
							</div>
						</div>
					</section>

					{/* How it Works */}
					<section className="mb-10">
						<div className="flex items-center gap-3 mb-5">
							<Globe className="h-5 w-5 text-primary" />
							<h2 className="text-xl font-semibold">{t("howItWorks")}</h2>
						</div>
						<Accordion type="single" collapsible className="w-full">
							<AccordionItem value="item-1">
								<AccordionTrigger>{t("howItWorksStep1Title")}</AccordionTrigger>
								<AccordionContent>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{t("howItWorksStep1Description")}
									</p>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-2">
								<AccordionTrigger>{t("howItWorksStep2Title")}</AccordionTrigger>
								<AccordionContent>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{t("howItWorksStep2Description")}
									</p>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>{t("howItWorksStep3Title")}</AccordionTrigger>
								<AccordionContent>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{t("howItWorksStep3Description")}
									</p>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</section>

					{/* Disclaimer */}
					<section className="mb-10 p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
						<div className="flex items-start gap-4">
							<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
							<div>
								<h2 className="text-xl font-semibold mb-2">
									{t("importantDisclaimer")}
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed mb-3">
									{t("disclaimerText1")}
								</p>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{t("disclaimerText2")}
								</p>
							</div>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</div>
	);
}
