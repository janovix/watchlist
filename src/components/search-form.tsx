"use client";

import type React from "react";
import { useState } from "react";
import { Search, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import type { WatchlistSearchRequest } from "@/lib/api/watchlist-search";

interface SearchFormProps {
	onSearch: (params: WatchlistSearchRequest) => void;
	isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
	const [name, setName] = useState("");
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [identifiers, setIdentifiers] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [countries, setCountries] = useState("");
	const { t } = useLanguage();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			const params: WatchlistSearchRequest = {
				q: name.trim(),
			};

			// Add optional fields if provided
			if (identifiers.trim()) {
				params.identifiers = identifiers
					.split(",")
					.map((id) => id.trim())
					.filter((id) => id.length > 0);
			}

			if (birthDate.trim()) {
				params.birthDate = birthDate.trim();
			}

			if (countries.trim()) {
				params.countries = countries
					.split(",")
					.map((c) => c.trim().toUpperCase())
					.filter((c) => c.length > 0);
			}

			onSearch(params);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="w-full space-y-4">
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

			{/* Advanced Search Toggle */}
			<div className="flex justify-center">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="text-muted-foreground hover:text-foreground"
				>
					{showAdvanced ? (
						<>
							<ChevronUp className="h-4 w-4 mr-2" />
							{t("hideAdvancedSearch")}
						</>
					) : (
						<>
							<ChevronDown className="h-4 w-4 mr-2" />
							{t("advancedSearch")}
						</>
					)}
				</Button>
			</div>

			{/* Advanced Search Fields */}
			{showAdvanced && (
				<div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
					<div className="space-y-2">
						<Label htmlFor="identifiers" className="text-sm font-medium">
							{t("identifiersLabel")}
						</Label>
						<Input
							id="identifiers"
							type="text"
							placeholder={t("identifiersPlaceholder")}
							value={identifiers}
							onChange={(e) => setIdentifiers(e.target.value)}
							disabled={isLoading}
							className="h-10"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="birthDate" className="text-sm font-medium">
							{t("birthDateLabel")}
						</Label>
						<Input
							id="birthDate"
							type="date"
							value={birthDate}
							onChange={(e) => setBirthDate(e.target.value)}
							disabled={isLoading}
							className="h-10"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="countries" className="text-sm font-medium">
							{t("countriesLabel")}
						</Label>
						<Input
							id="countries"
							type="text"
							placeholder={t("countriesPlaceholder")}
							value={countries}
							onChange={(e) => setCountries(e.target.value)}
							disabled={isLoading}
							className="h-10"
						/>
					</div>
				</div>
			)}
		</form>
	);
}
