"use client";

import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	Shield,
	Database,
	Globe,
	AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export default function InfoPage() {
	const router = useRouter();
	const { t } = useLanguage();

	const navigateBack = () => {
		router.push("/");
	};

	return (
		<main className="min-h-screen px-4 md:px-8 py-8 pt-20">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<Button variant="ghost" onClick={navigateBack} className="mb-6 -ml-2">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Home
				</Button>

				<div className="mb-10">
					<h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
						About Watchlist
					</h1>
					<p className="text-muted-foreground text-lg text-pretty">
						Background screening and due diligence platform for compliance
						officers, KYC teams, and business operators in the Mexican market
						and the USMCA region.
					</p>
				</div>

				{/* What is Watchlist */}
				<section className="mb-10 p-6 rounded-xl bg-card/80 backdrop-blur-sm border">
					<div className="flex items-start gap-4 mb-4">
						<div className="p-2 rounded-lg bg-primary/10">
							<Shield className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-xl font-semibold mb-2">What is Watchlist?</h2>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Watchlist is a background screening tool designed for compliance
								and KYC officers within organizations, as well as business
								operators who need to screen clients or associates before
								conducting business. The platform consolidates multiple public
								data sources into a single query workflow, enabling informed
								decision-making at speed.
							</p>
						</div>
					</div>
				</section>

				{/* Data Sources */}
				<section className="mb-10">
					<div className="flex items-center gap-3 mb-5">
						<Database className="h-5 w-5 text-primary" />
						<h2 className="text-xl font-semibold">Data Sources</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
							<h3 className="font-semibold mb-2">OFAC SDN List</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								The U.S. Department of the Treasury Office of Foreign Assets
								Control (OFAC) Specially Designated Nationals and Blocked
								Persons List (SDN). Includes sanctioned individuals and entities
								with whom commercial transactions are prohibited under U.S. law.
							</p>
						</div>
						<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
							<h3 className="font-semibold mb-2">SAT 69-B (EFOS)</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Companies that Invoice Simulated Operations (EFOS), published by
								Mexico's Tax Administration Service (SAT) under Article 69-B of
								the Federal Fiscal Code. Identifies taxpayers presumed to be
								involved in issuing invoices covering non-existent operations.
							</p>
						</div>
						<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
							<h3 className="font-semibold mb-2">UN Sanctions List</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								United Nations Security Council Consolidated Sanctions List.
								Includes individuals and entities subject to sanctions measures
								imposed by the UN Security Council.
							</p>
						</div>
						<div className="p-5 rounded-lg bg-card/80 backdrop-blur-sm border">
							<h3 className="font-semibold mb-2">PEP Database</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Politically Exposed Persons (PEP) database from Mexican
								government transparency platforms. Identifies individuals
								holding or having held prominent public positions.
							</p>
						</div>
					</div>
				</section>

				{/* How it Works */}
				<section className="mb-10">
					<div className="flex items-center gap-3 mb-5">
						<Globe className="h-5 w-5 text-primary" />
						<h2 className="text-xl font-semibold">How It Works</h2>
					</div>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<AccordionTrigger>1. Enter Search Query</AccordionTrigger>
							<AccordionContent>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Enter the name of an individual or company you want to screen.
									You can optionally provide additional information like birth
									date, identifiers (RFC, CURP), or country of origin to improve
									matching accuracy.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger>2. Hybrid Search Algorithm</AccordionTrigger>
							<AccordionContent>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Our system performs a hybrid search combining exact identifier
									matching, semantic vector search, and Jaro-Winkler name
									similarity scoring across all data sources simultaneously.
									This ensures high accuracy while catching variations in names
									and spellings.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-3">
							<AccordionTrigger>3. Review Results</AccordionTrigger>
							<AccordionContent>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Results are organized by data source (OFAC, SAT 69-B, UNSC,
									PEP) with match scores and detailed information for each hit.
									You can review the full details of each match to make informed
									decisions about your due diligence process.
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
								Important Disclaimer
							</h2>
							<p className="text-muted-foreground text-sm leading-relaxed mb-3">
								Watchlist is a screening tool that aggregates publicly available
								data from official government sources. The information provided
								is for informational purposes only and should not be considered
								as legal advice or a definitive determination of risk.
							</p>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Users are responsible for conducting their own due diligence and
								verifying information through official channels. Janovix is not
								liable for decisions made based on the information provided by
								this platform.
							</p>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="mt-12 pt-6 border-t border-border/50">
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
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
			</div>
		</main>
	);
}
