"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
	COUNTRY_OPTIONS,
	getCountryByCode,
	type CountryOption,
} from "@/lib/countries";

export interface CountryMultiSelectProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	label?: string;
	id?: string;
	/** Used when no country found in list (e.g. "No country found") */
	emptySearchText?: string;
}

function matchCountry(option: CountryOption, search: string): boolean {
	if (!search.trim()) return true;
	const s = search.trim().toLowerCase();
	const name = option.name.toLowerCase();
	const code = option.code.toLowerCase();
	return name.includes(s) || code.includes(s);
}

export function CountryMultiSelect({
	value,
	onChange,
	placeholder = "Select countries...",
	label,
	id,
	emptySearchText = "No country found",
}: CountryMultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const selectedSet = React.useMemo(() => new Set(value), [value]);
	const filteredOptions = React.useMemo(
		() =>
			search.trim()
				? COUNTRY_OPTIONS.filter((c) => matchCountry(c, search))
				: COUNTRY_OPTIONS,
		[search],
	);

	const toggle = (code: string) => {
		const next = selectedSet.has(code)
			? value.filter((c) => c !== code)
			: [...value, code];
		onChange(next);
	};

	const remove = (code: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(value.filter((c) => c !== code));
	};

	const triggerId = id ?? "country-multi-select-trigger";
	const listboxId = "country-multi-select-listbox";

	return (
		<div className="flex flex-col gap-2">
			{label && (
				<Label htmlFor={triggerId} className="text-sm font-medium">
					{label}
				</Label>
			)}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div
						id={triggerId}
						role="combobox"
						aria-expanded={open}
						aria-haspopup="listbox"
						aria-label={label ?? "Countries"}
						aria-controls={listboxId}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setOpen((prev) => !prev);
							}
						}}
						className={cn(
							"min-h-10 h-auto w-full flex items-center justify-between gap-2 rounded-md border border-input bg-secondary px-4 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
							value.length === 0 && "text-muted-foreground",
						)}
					>
						{value.length === 0 ? (
							<span>{placeholder}</span>
						) : (
							<div className="flex flex-wrap gap-1">
								{value.map((code) => {
									const country = getCountryByCode(code);
									const badgeLabel = country
										? `${country.name} (${country.code})`
										: code;
									return (
										<Badge
											key={code}
											variant="secondary"
											className="gap-1 pr-1"
										>
											{badgeLabel}
											<span
												role="button"
												tabIndex={0}
												onClick={(e) => remove(code, e)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														remove(code, e as unknown as React.MouseEvent);
													}
												}}
												className="rounded-full p-0.5 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
												aria-label={`Remove ${badgeLabel}`}
											>
												<X className="h-3 w-3" />
											</span>
										</Badge>
									);
								})}
							</div>
						)}
						<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
					</div>
				</PopoverTrigger>
				<PopoverContent
					className="w-(--radix-popover-trigger-width) min-w-72 p-0"
					align="start"
					onCloseAutoFocus={(e) => {
						setSearch("");
					}}
				>
					<Command
						shouldFilter={false}
						label={label ?? "Countries"}
						className="rounded-md border-0"
					>
						<CommandInput
							placeholder="Search countries..."
							value={search}
							onValueChange={setSearch}
							aria-label="Search countries"
						/>
						<CommandList id={listboxId} role="listbox" aria-label="Countries">
							<CommandEmpty>{emptySearchText}</CommandEmpty>
							<CommandGroup>
								{filteredOptions.map((option) => {
									const selected = selectedSet.has(option.code);
									return (
										<CommandItem
											key={option.code}
											value={`${option.code}|${option.name}`}
											role="option"
											aria-selected={selected}
											onSelect={() => toggle(option.code)}
											className="cursor-pointer"
										>
											<span className="flex-1">
												{option.name} ({option.code})
											</span>
											{selected ? (
												<Check className="h-4 w-4 shrink-0 text-primary" />
											) : null}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
