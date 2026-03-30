"use client";

import Link from "next/link";
import { LanguageSwitcher, ThemeSwitcher } from "@algenium/blocks";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OrgPicker } from "@/components/org-picker";
import { UserMenu } from "@/components/user-menu";

const WATCHLIST_LANGUAGES = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
] as const;

type WatchlistLangKey = (typeof WATCHLIST_LANGUAGES)[number]["key"];

function isWatchlistLangKey(key: string): key is WatchlistLangKey {
	return WATCHLIST_LANGUAGES.some((l) => l.key === key);
}

function HeaderNavPickers() {
	const { language, setLanguage, t } = useLanguage();
	return (
		<TooltipProvider delayDuration={0}>
			<div className="flex items-center gap-1.5 sm:gap-2">
				<LanguageSwitcher
					languages={[...WATCHLIST_LANGUAGES]}
					currentLanguage={language}
					onLanguageChange={(key: string) => {
						if (isWatchlistLangKey(key)) setLanguage(key);
					}}
					labels={{ language: t("languageLabel") }}
					variant="mini"
					size="sm"
					shape="rounded"
					side="bottom"
					align="end"
				/>
				<ThemeSwitcher
					variant="mini"
					size="sm"
					shape="rounded"
					side="bottom"
					align="end"
					labels={{
						theme: t("themeLabel"),
						system: t("themeSystem"),
						light: t("themeLight"),
						dark: t("themeDark"),
					}}
				/>
			</div>
		</TooltipProvider>
	);
}

export function Header() {
	return (
		<header className="border-b border-border bg-background sticky top-0">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 sm:py-3">
				<div className="flex items-center justify-between gap-2 sm:gap-4">
					{/* Left side: Logo only */}
					<Link
						href="/"
						className="flex items-center gap-2 sm:gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
					>
						<Logo
							variant="icon"
							width={24}
							height={24}
							className="sm:w-6 sm:h-6"
						/>
						<h1 className="text-xl font-bold mt-1">Watchlist</h1>
					</Link>

					{/* Right side controls */}
					<div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
						<HeaderNavPickers />
						<OrgPicker />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	);
}
