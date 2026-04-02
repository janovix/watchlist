"use client";

import { Logo } from "@/components/logo";
import { getHomepageUrl, getPrivacyUrl, getTermsUrl } from "@/lib/config-urls";
import { useLanguage } from "@/components/language-provider";
import { LAYOUT_OUTER } from "@/lib/layout";
import { cn } from "@/lib/utils";

export function Footer() {
	const { t } = useLanguage();

	return (
		<footer className="mt-auto w-full border-t border-border/50 bg-background py-4">
			<div className={cn(LAYOUT_OUTER, "space-y-4")}>
				<div className="mx-auto w-full max-w-4xl">
					<p className="text-pretty text-xs text-justify leading-relaxed whitespace-pre-line text-muted-foreground/90">
						{t("legalDisclaimerFinePrint")}
					</p>
				</div>
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
			</div>
		</footer>
	);
}
