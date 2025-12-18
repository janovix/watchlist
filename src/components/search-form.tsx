"use client";

import type React from "react";
import { useState } from "react";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/language-provider";

interface SearchFormProps {
	onSearch: (name: string) => void;
	isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
	const [name, setName] = useState("");
	const { t } = useLanguage();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			onSearch(name.trim());
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full">
			<div className="relative">
				<User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
				<Input
					id="pep-search-input"
					type="text"
					placeholder={t("searchPlaceholder")}
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={isLoading}
					className="pl-10 sm:pl-12 pr-12 sm:pr-14 h-12 sm:h-14 text-base sm:text-lg bg-background border-border rounded-full shadow-sm focus:border-primary focus:ring-primary focus:ring-2"
				/>
				<Button
					type="submit"
					disabled={!name.trim() || isLoading}
					size="icon"
					className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary hover:bg-primary/90"
					aria-label={t("searchButton")}
				>
					<Search className="h-4 w-4 sm:h-5 sm:w-5" />
				</Button>
			</div>
		</form>
	);
}
