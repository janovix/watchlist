"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";

export function Header() {
	return (
		<header className="border-b border-border bg-background sticky top-0 z-50">
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
						<LanguageToggle />
						<ThemeToggle />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	);
}
