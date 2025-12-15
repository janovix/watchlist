"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import type { Language } from "@/lib/translations";

const languages: { code: Language; label: string }[] = [
	{ code: "pt", label: "PT" },
	{ code: "es", label: "ES" },
	{ code: "en", label: "EN" },
];

export function LanguageToggle() {
	const { language, setLanguage } = useLanguage();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

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

	const handleSelect = (code: Language) => {
		setLanguage(code);
		setIsOpen(false);
	};

	const currentLabel =
		languages.find((l) => l.code === language)?.label || "ES";

	return (
		<div ref={containerRef} className="relative">
			<Button
				variant="ghost"
				size="sm"
				className="h-8 px-3 text-xs font-medium rounded-lg bg-secondary text-foreground"
				onClick={() => setIsOpen(!isOpen)}
			>
				{currentLabel}
			</Button>

			{isOpen && (
				<div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 flex flex-col gap-1 p-1 rounded-lg bg-secondary shadow-lg border border-border z-50">
					{languages.map((lang) => (
						<Button
							key={lang.code}
							variant="ghost"
							size="sm"
							className={`h-8 px-3 text-xs font-medium ${
								language === lang.code
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => handleSelect(lang.code)}
						>
							{lang.label}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}
