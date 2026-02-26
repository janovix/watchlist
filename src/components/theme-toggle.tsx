"use client";

import { useEffect, useState, useCallback } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

type Theme = "system" | "light" | "dark";

const themes = [
	{
		key: "system" as Theme,
		icon: Monitor,
		labelKey: "themeSystem" as const,
	},
	{
		key: "light" as Theme,
		icon: Sun,
		labelKey: "themeLight" as const,
	},
	{
		key: "dark" as Theme,
		icon: Moon,
		labelKey: "themeDark" as const,
	},
];

export type ThemeToggleProps = {
	className?: string;
	/** Size of the switcher */
	size?: "sm" | "md" | "lg";
	/** Shape of the button */
	shape?: "rounded" | "pill";
	/** Mini variant shows only current theme icon as dropdown */
	variant?: "default" | "mini";
	/** Dropdown alignment (for mini variant) */
	align?: "start" | "center" | "end";
	/** Dropdown side (for mini variant) */
	side?: "top" | "bottom" | "left" | "right";
};

const sizeClasses = {
	sm: {
		container: "h-7 p-0.5",
		button: "h-6 w-6",
		buttonMini: "h-7 w-7",
		icon: "h-3.5 w-3.5",
		iconMini: "h-3.5 w-3.5",
	},
	md: {
		container: "h-8 p-1",
		button: "h-6 w-6",
		buttonMini: "h-8 w-8",
		icon: "h-4 w-4",
		iconMini: "h-4 w-4",
	},
	lg: {
		container: "h-9 p-1",
		button: "h-7 w-7",
		buttonMini: "h-9 w-9",
		icon: "h-4 w-4",
		iconMini: "h-4.5 w-4.5",
	},
};

const shapeClasses = {
	rounded: "rounded-md",
	pill: "rounded-full",
};

export function ThemeToggle({
	className,
	size = "sm",
	shape = "rounded",
	variant = "default",
	align = "center",
	side = "top",
}: ThemeToggleProps) {
	const [theme, setThemeState] = useState<Theme>("system");
	const [mounted, setMounted] = useState(false);
	const { t } = useLanguage();
	const sizes = sizeClasses[size];
	const shapeClass = shapeClasses[shape];

	useEffect(() => {
		setMounted(true);
		const stored = localStorage.getItem("theme") as Theme | null;
		if (stored) {
			setThemeState(stored);
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

	const handleThemeClick = useCallback((newTheme: Theme) => {
		setThemeState(newTheme);
	}, []);

	if (!mounted) {
		return (
			<div
				className={cn(
					variant === "mini" ? sizes.buttonMini : sizes.container,
					shapeClass,
					variant === "default" && "bg-secondary",
					className,
				)}
			/>
		);
	}

	const CurrentIcon = themes.find((t) => t.key === theme)?.icon || Monitor;

	// Mini variant - dropdown with current theme icon
	if (variant === "mini") {
		return (
			<DropdownMenu modal={false}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									sizes.buttonMini,
									shapeClass,
									"bg-secondary text-foreground",
									className,
								)}
							>
								<CurrentIcon className={sizes.iconMini} />
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={8}>
						{t("themeLabel")}
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent side={side} align={align} sideOffset={8}>
					{themes.map(({ key, icon: Icon, labelKey }) => (
						<DropdownMenuItem
							key={key}
							onClick={() => handleThemeClick(key)}
							className={cn(
								"gap-2 cursor-pointer",
								theme === key && "bg-accent",
							)}
						>
							<Icon className="h-4 w-4" />
							<span>{t(labelKey)}</span>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	// Default variant - segmented control
	return (
		<div
			className={cn(
				"relative isolate flex bg-secondary",
				sizes.container,
				shapeClass,
				className,
			)}
		>
			{themes.map(({ key, icon: Icon, labelKey }) => {
				const isActive = theme === key;

				return (
					<Button
						key={key}
						variant="ghost"
						size="icon"
						aria-label={t(labelKey)}
						className={cn(
							sizes.button,
							shapeClass,
							isActive
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
						onClick={() => handleThemeClick(key)}
					>
						<Icon className={sizes.icon} />
					</Button>
				);
			})}
		</div>
	);
}
