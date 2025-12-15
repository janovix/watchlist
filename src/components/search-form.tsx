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
		<form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
			<div className="flex flex-col gap-4">
				<div className="relative">
					<User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
					<Input
						type="text"
						placeholder={t("searchPlaceholder")}
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={isLoading}
						className="pl-12 h-14 text-lg bg-secondary border-border focus:border-primary focus:ring-primary"
					/>
				</div>
				<Button
					type="submit"
					disabled={!name.trim() || isLoading}
					className="h-12 text-base font-medium bg-primary hover:bg-primary/90"
				>
					<Search className="mr-2 h-5 w-5" />
					{t("searchButton")}
				</Button>
			</div>
		</form>
	);
}
