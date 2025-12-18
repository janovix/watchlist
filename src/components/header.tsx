"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { SearchForm } from "@/components/search-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { UserMenu } from "@/components/user-menu";

interface HeaderProps {
	onSearch?: (name: string) => void;
	isLoading?: boolean;
}

export function Header({ onSearch, isLoading = false }: HeaderProps) {
	const router = useRouter();

	const handleSearch = (name: string) => {
		if (onSearch) {
			onSearch(name);
		} else {
			// Default behavior: generate query ID and navigate
			const queryId = crypto.randomUUID();
			try {
				sessionStorage.setItem(
					`pep-pending-${queryId}`,
					JSON.stringify({ searchName: name }),
				);
			} catch (e) {
				console.log("[v0] Error saving pending search:", e);
			}
			router.push(`/${queryId}`);
		}
	};

	return (
		<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 py-3">
				<div className="flex items-center gap-4">
					{/* Left side: Logo + Watchlist */}
					<div className="flex items-center gap-3 flex-shrink-0">
						<Logo variant="icon" width={32} height={32} />
						<span className="text-sm font-medium text-foreground">
							Watchlist
						</span>
					</div>

					{/* Search Input - Centered with equal spacing */}
					<div className="flex-1 flex justify-center">
						<div className="w-full max-w-2xl">
							<SearchForm onSearch={handleSearch} isLoading={isLoading} />
						</div>
					</div>

					{/* Right side controls - matching left side width for centering */}
					<div className="flex items-center gap-2 flex-shrink-0 w-[140px] justify-end">
						<LanguageToggle />
						<ThemeToggle />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	);
}
