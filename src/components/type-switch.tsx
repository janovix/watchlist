"use client";

import * as React from "react";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface TypeSwitchProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	className?: string;
	compact?: boolean;
}

function TypeSwitch({
	className,
	checked,
	onCheckedChange,
	compact = false,
}: TypeSwitchProps) {
	const ariaLabel = checked ? "Company" : "Individual";
	const tooltipLabel = checked ? "Company" : "Individual";

	if (compact) {
		return (
			<TooltipProvider delayDuration={200}>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							role="switch"
							aria-checked={checked}
							aria-label={ariaLabel}
							onClick={() => onCheckedChange(!checked)}
							className={cn(
								"relative inline-flex h-10 w-[4.75rem] shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								className,
							)}
						>
							{/* Sliding indicator - blue for individual, primary for company */}
							<span
								className={cn(
									"absolute h-8 w-8 rounded-full shadow-sm transition-all duration-300 ease-in-out",
									checked
										? "left-[calc(100%-2.25rem)] bg-primary"
										: "left-1 bg-blue-500",
								)}
							/>
							{/* Icons in equal halves, centered in each half */}
							<span className="relative z-10 grid w-full grid-cols-2">
								<span className="flex items-center justify-center">
									<User
										className={cn(
											"h-4 w-4 transition-colors duration-300",
											!checked ? "text-white" : "text-muted-foreground",
										)}
									/>
								</span>
								<span className="flex items-center justify-center">
									<Building2
										className={cn(
											"h-4 w-4 transition-colors duration-300",
											checked
												? "text-primary-foreground"
												: "text-muted-foreground",
										)}
									/>
								</span>
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{tooltipLabel}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						role="switch"
						aria-checked={checked}
						aria-label={ariaLabel}
						onClick={() => onCheckedChange(!checked)}
						className={cn(
							"relative inline-flex h-12 w-64 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							checked
								? "bg-purple-500/20 border-purple-500/50"
								: "bg-blue-500/20 border-blue-500/50",
							className,
						)}
					>
						{/* Sliding thumb */}
						<span
							className={cn(
								"absolute top-[3px] flex items-center justify-center gap-2 h-10 w-32 rounded-full shadow-lg transition-all duration-200 ease-in-out px-3",
								checked
									? "left-[calc(100%-3px)] -translate-x-full bg-purple-500"
									: "left-[3px] bg-blue-500",
							)}
						>
							{checked ? (
								<>
									<Building2 className="h-5 w-5 text-white flex-shrink-0" />
									<span className="text-white text-sm font-medium">
										Companies
									</span>
								</>
							) : (
								<>
									<User className="h-5 w-5 text-white flex-shrink-0" />
									<span className="text-white text-sm font-medium">
										Individuals
									</span>
								</>
							)}
						</span>
						{/* Background labels */}
						<span className="relative z-0 flex w-full items-center justify-between px-6 pointer-events-none">
							<span
								className={cn(
									"text-sm font-medium transition-opacity",
									!checked ? "opacity-0" : "opacity-50",
								)}
							>
								<User className="h-5 w-5" />
							</span>
							<span
								className={cn(
									"text-sm font-medium transition-opacity",
									checked ? "opacity-0" : "opacity-50",
								)}
							>
								<Building2 className="h-5 w-5" />
							</span>
						</span>
					</button>
				</TooltipTrigger>
				<TooltipContent side="bottom">{tooltipLabel}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
TypeSwitch.displayName = "TypeSwitch";

export { TypeSwitch };
