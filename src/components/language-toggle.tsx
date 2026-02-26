"use client";

import { ChevronDown, Languages } from "lucide-react";
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
import type { Language } from "@/lib/translations";

const languages: { code: Language; label: string }[] = [
	{ code: "es", label: "ES" },
	{ code: "en", label: "EN" },
];

export type LanguageToggleProps = {
	className?: string;
	/** Size of the switcher */
	size?: "sm" | "md" | "lg";
	/** Shape of the button */
	shape?: "rounded" | "pill";
	/** Mini variant shows only an icon */
	variant?: "default" | "mini";
	/** Show globe icon in default variant */
	showIcon?: boolean;
	/** Dropdown alignment */
	align?: "start" | "center" | "end";
	/** Dropdown side */
	side?: "top" | "bottom" | "left" | "right";
};

const sizeClasses = {
	sm: {
		button: "h-7 px-2 text-xs",
		buttonMini: "h-7 w-7",
		icon: "size-3",
		iconMini: "size-3.5",
		chevron: "size-3",
	},
	md: {
		button: "h-8 px-2.5 text-xs",
		buttonMini: "h-8 w-8",
		icon: "size-3.5",
		iconMini: "size-4",
		chevron: "size-3",
	},
	lg: {
		button: "h-9 px-3 text-sm",
		buttonMini: "h-9 w-9",
		icon: "size-4",
		iconMini: "size-4.5",
		chevron: "size-3.5",
	},
};

const shapeClasses = {
	rounded: "rounded-md",
	pill: "rounded-full",
};

export function LanguageToggle({
	className,
	size = "sm",
	shape = "rounded",
	variant = "default",
	showIcon = false,
	align = "center",
	side = "top",
}: LanguageToggleProps) {
	const { language, setLanguage, t } = useLanguage();
	const sizes = sizeClasses[size];
	const shapeClass = shapeClasses[shape];

	const currentLabel =
		languages.find((l) => l.code === language)?.label || "ES";

	const isMini = variant === "mini";

	const button = (
		<Button
			variant="ghost"
			size={isMini ? "icon" : "sm"}
			className={cn(
				isMini ? sizes.buttonMini : sizes.button,
				shapeClass,
				"gap-1 font-semibold uppercase bg-secondary text-foreground",
				className,
			)}
		>
			{isMini ? (
				<Languages className={sizes.iconMini} />
			) : (
				<>
					{showIcon && <Languages className={sizes.icon} />}
					{currentLabel}
					<ChevronDown className={cn(sizes.chevron, "opacity-60")} />
				</>
			)}
		</Button>
	);

	const dropdownContent = (
		<DropdownMenuContent
			side={side}
			align={align}
			sideOffset={8}
			className="min-w-[3.5rem]"
		>
			{languages.map((lang) => (
				<DropdownMenuItem
					key={lang.code}
					onClick={() => setLanguage(lang.code)}
					className={cn(
						"justify-center text-xs font-semibold cursor-pointer",
						language === lang.code && "bg-accent",
					)}
				>
					{lang.label}
				</DropdownMenuItem>
			))}
		</DropdownMenuContent>
	);

	if (isMini) {
		return (
			<DropdownMenu modal={false}>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={8}>
						{t("languageLabel")}
					</TooltipContent>
				</Tooltip>
				{dropdownContent}
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>
			{dropdownContent}
		</DropdownMenu>
	);
}
