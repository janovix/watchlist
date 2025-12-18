"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";

export function Header() {
	return (
		<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
				<div className="flex items-center justify-between gap-2 sm:gap-4">
					{/* Left side: Logo + Watchlist */}
					<Link
						href="/"
						className="flex items-center gap-2 sm:gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
					>
						<Logo
							variant="icon"
							width={28}
							height={28}
							className="sm:w-8 sm:h-8"
						/>
						<span className="text-xs sm:text-sm font-medium text-foreground">
							Watchlist
						</span>
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
