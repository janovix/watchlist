"use client";

import { useEffect, useState, useRef } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

type Theme = "system" | "light" | "dark";

const themeIcons = {
	system: Monitor,
	light: Sun,
	dark: Moon,
};

export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useLanguage();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) {
			setTheme(stored);
		}
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const root = document.documentElement;

		if (theme === "system") {
			const systemDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			root.classList.toggle("dark", systemDark);
		} else {
			root.classList.toggle("dark", theme === "dark");
		}

		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	useEffect(() => {
		if (!mounted || theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (e: MediaQueryListEvent) => {
			document.documentElement.classList.toggle("dark", e.matches);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, mounted]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (newTheme: Theme) => {
		setTheme(newTheme);
		setIsOpen(false);
	};

	if (!mounted) {
		return <div className="h-8 w-8 rounded-lg bg-secondary" />;
	}

	const CurrentIcon = themeIcons[theme];
	const themes: Theme[] = ["system", "light", "dark"];

	return (
		<div ref={containerRef} className="relative">
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 rounded-lg bg-secondary text-foreground"
				onClick={() => setIsOpen(!isOpen)}
			>
				<CurrentIcon className="h-4 w-4" />
			</Button>

			{isOpen && (
				<div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex flex-col gap-1 p-1 rounded-lg bg-secondary shadow-lg border border-border z-50">
					{themes.map((t) => {
						const Icon = themeIcons[t];
						return (
							<Button
								key={t}
								variant="ghost"
								size="icon"
								className={`h-8 w-8 ${
									theme === t
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
								onClick={() => handleSelect(t)}
							>
								<Icon className="h-4 w-4" />
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
}
