"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { getHomepageUrl, getPrivacyUrl, getTermsUrl } from "@/lib/config-urls";
import { useLanguage } from "@/components/language-provider";
import {
	LAYOUT_HORIZONTAL_PAD,
	LAYOUT_INFO_COLUMN,
	LAYOUT_NARROW,
	LAYOUT_OUTER,
} from "@/lib/layout";
import { cn } from "@/lib/utils";
import { DataEnvBadge } from "@/components/data-env-badge";

/**
 * Query list renders `<Footer />` inside `LAYOUT_OUTER` — skip the footer's outer shell
 * to avoid double padding; use full width for the legal block to match the table.
 * Query detail applies `LAYOUT_HORIZONTAL_PAD` + `LAYOUT_NARROW` on one element (same as
 * main) so padding sits inside the max-width; footer must mirror that or fine print reads wider than cards.
 * Info page uses `max-w-4xl` for main; home uses `LAYOUT_OUTER` + `LAYOUT_NARROW`.
 */
export function Footer() {
	const { t } = useLanguage();
	const pathname = usePathname();
	const isQueryListPage = pathname === "/queries";
	const isQueryDetailPage =
		pathname != null && /^\/queries\/[^/]+$/.test(pathname);
	const isInfoPage = pathname === "/info";

	const outerClass = isQueryListPage
		? "w-full space-y-4"
		: cn(LAYOUT_OUTER, "space-y-4");

	const innerClass = isQueryListPage
		? "w-full space-y-4"
		: isInfoPage
			? cn(LAYOUT_INFO_COLUMN, "space-y-4")
			: cn(LAYOUT_NARROW, "space-y-4");

	const queryDetailColumnClass = cn(
		LAYOUT_HORIZONTAL_PAD,
		LAYOUT_NARROW,
		"space-y-4",
	);

	const footerColumn = (
		<>
			<p className="text-pretty text-xs text-justify leading-relaxed whitespace-pre-line text-muted-foreground/90">
				{t("legalDisclaimerFinePrint")}
			</p>
			<div className="flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground md:flex-row md:gap-4">
				<div className="flex items-center gap-2 opacity-80">
					<a
						href={getHomepageUrl()}
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors hover:text-foreground"
					>
						<Logo variant="logo" width={80} height={14} />
					</a>
				</div>
				<div className="flex items-center gap-4">
					<span>&copy; {new Date().getFullYear()} Janovix</span>
					<DataEnvBadge />
					<a
						href={getPrivacyUrl()}
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors hover:text-foreground"
					>
						{t("privacy")}
					</a>
					<a
						href={getTermsUrl()}
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors hover:text-foreground"
					>
						{t("terms")}
					</a>
				</div>
			</div>
		</>
	);

	return (
		<footer className="mt-auto w-full border-t border-border/50 bg-background py-4">
			{isQueryDetailPage ? (
				<div className={queryDetailColumnClass}>{footerColumn}</div>
			) : (
				<div className={outerClass}>
					<div className={innerClass}>{footerColumn}</div>
				</div>
			)}
		</footer>
	);
}
