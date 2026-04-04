"use client";

import { useLanguage } from "@/components/language-provider";
import { useSubscriptionSafe } from "@/lib/subscription";
import { useOrganization } from "@/hooks/useOrganization";
import type { PlanTier } from "@/lib/subscription/subscriptionClient";

function planDisplayName(plan: PlanTier | null, lang: "es" | "en"): string {
	if (!plan || plan === "none" || plan === "free") {
		return lang === "es" ? "Sin plan activo" : "No active plan";
	}
	const labels: Record<string, { es: string; en: string }> = {
		watchlist: { es: "Watchlist", en: "Watchlist" },
		business: { es: "Business", en: "Business" },
		pro: { es: "Pro", en: "Pro" },
		ultra: { es: "Ultra", en: "Ultra" },
		enterprise: { es: "Enterprise", en: "Enterprise" },
	};
	const row = labels[plan];
	return row ? row[lang] : plan;
}

/**
 * Clarifies that Watchlist access follows the active org owner's subscription.
 */
export function EntitlementAttributionFooter() {
	const { t, language } = useLanguage();
	const subState = useSubscriptionSafe();
	const { org, isLoading: orgLoading } = useOrganization();

	const orgName = org?.name?.trim();
	const plan = subState?.subscription?.plan ?? null;
	const planLabel = planDisplayName(plan, language);

	if (!orgName || orgLoading || subState?.isLoading) {
		return null;
	}

	const text = t("entitlementFooter")
		.replace("{organization}", orgName)
		.replace("{plan}", planLabel);

	return (
		<footer className="mt-auto shrink-0 border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
			{text}
		</footer>
	);
}
