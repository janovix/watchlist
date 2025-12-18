"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";

export function Navbar() {
	const { t } = useLanguage();

	return (
		<nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-[81px] z-40">
			<div className="container mx-auto px-4 py-2">
				<div className="flex items-center gap-3">
					<Link
						href="/"
						className="flex items-center gap-2 hover:opacity-80 transition-opacity"
					>
						<Logo variant="icon" width={24} height={24} />
						<span className="text-sm font-medium text-foreground">
							Watchlist
						</span>
					</Link>
				</div>
			</div>
		</nav>
	);
}
