"use client";

import { useSubscriptionSafe } from "@/lib/subscription";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface SubscriptionBannerProps {
	/** The billing page URL */
	billingUrl?: string;
	/** Whether to show the banner even without limits (for free tier) */
	showFreeTierBanner?: boolean;
	/** Whether the banner can be dismissed */
	dismissible?: boolean;
}

/**
 * Banner component that shows subscription status warnings
 *
 * - Shows upgrade prompt for free tier users
 * - Usage limits are enforced on the backend via usage-rights system
 */
export function SubscriptionBanner({
	billingUrl,
	showFreeTierBanner = true,
	dismissible = true,
}: SubscriptionBannerProps) {
	const subscription = useSubscriptionSafe();
	const { t } = useLanguage();
	const [dismissed, setDismissed] = useState(false);

	// Build auth billing URL based on current location
	const authBillingUrl =
		billingUrl ||
		(typeof window !== "undefined"
			? `${window.location.origin.replace("watchlist.", "auth.")}/settings/billing`
			: "/settings/billing");

	// Don't render if dismissed or no subscription context
	if (dismissed || !subscription) {
		return null;
	}

	const { isLoading, isFreeTier, hasPaidSubscription } = subscription;

	// Don't show while loading
	if (isLoading) {
		return null;
	}

	// Only show for free tier users
	if (!isFreeTier || !showFreeTierBanner || hasPaidSubscription) {
		return null;
	}

	return (
		<Alert
			className={`rounded-none border-x-0 border-t-0 bg-primary/10 border-primary/30 text-primary`}
		>
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-3">
					<Zap className="h-4 w-4" />
					<div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
						<span className="font-medium text-sm">
							{t("subscriptionFreeTier")}
						</span>
						<AlertDescription className="text-sm opacity-90">
							{t("subscriptionFreeTierDesc")}
						</AlertDescription>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" asChild>
						<Link
							href={authBillingUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							{t("subscriptionUpgrade")}
						</Link>
					</Button>
					{dismissible && (
						<Button
							size="icon"
							variant="ghost"
							className="h-8 w-8"
							onClick={() => setDismissed(true)}
						>
							<X className="h-4 w-4" />
							<span className="sr-only">{t("dismiss")}</span>
						</Button>
					)}
				</div>
			</div>
		</Alert>
	);
}
