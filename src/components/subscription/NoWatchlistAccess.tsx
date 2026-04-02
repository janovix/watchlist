"use client";

import { useTranslation } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ShieldX, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAuthAppUrl } from "@/lib/auth/config";
import { Skeleton } from "@/components/ui/skeleton";
import { LAYOUT_HORIZONTAL_PAD, LAYOUT_NARROW } from "@/lib/layout";
import { cn } from "@/lib/utils";

interface NoWatchlistAccessProps {
	/** Whether the subscription is still loading */
	isLoading?: boolean;
}

/**
 * Full-page blocker shown when user doesn't have Watchlist product access
 *
 * This is displayed when a user doesn't have an active subscription
 * with the product_watchlist feature.
 */
export function NoWatchlistAccess({
	isLoading = false,
}: NoWatchlistAccessProps) {
	const { t } = useTranslation();

	const authAppBase = getAuthAppUrl();
	const authBillingUrl = `${authAppBase}/settings/billing`;
	const authSettingsUrl = `${authAppBase}/settings`;

	if (isLoading) {
		return (
			<div
				data-testid="no-watchlist-loading-skeleton"
				className={cn(
					"flex flex-1 flex-col bg-background py-8",
					LAYOUT_HORIZONTAL_PAD,
				)}
			>
				<div className={cn("flex flex-1 flex-col gap-6", LAYOUT_NARROW)}>
					<div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5">
						<Skeleton className="h-10 w-[88px] shrink-0 rounded-full" />
						<Skeleton className="flex-1 h-9 min-w-0 rounded-md" />
						<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
						<Skeleton className="h-9 w-9 shrink-0 rounded-full" />
					</div>
					<div className="rounded-xl border border-border overflow-hidden">
						<Skeleton className="h-14 w-full rounded-none" />
						<div className="p-4 space-y-3 bg-card">
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-12 w-full rounded-md" />
							))}
						</div>
					</div>
					<div className="rounded-xl border border-border p-6 space-y-3 bg-card/50">
						<Skeleton className="h-6 w-2/3 max-w-md" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
			<Card className="max-w-md w-full text-center shadow-lg">
				<CardHeader className="space-y-4">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
						<ShieldX className="h-8 w-8 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-semibold">
						{t("subscription.noWatchlistAccess.title")}
					</CardTitle>
					<CardDescription className="text-base">
						{t("subscription.noWatchlistAccess.description")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						{t("subscription.noWatchlistAccess.upgradePrompt")}
					</p>
					<div className="flex flex-col gap-3">
						<Button asChild size="lg" className="w-full">
							<Link
								href={authBillingUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								{t("subscription.noWatchlistAccess.upgradeCta")}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button
							variant="ghost"
							asChild
							size="sm"
							className="text-muted-foreground"
						>
							<Link
								href={authSettingsUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								{t("subscription.noWatchlistAccess.backToSettings")}
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
