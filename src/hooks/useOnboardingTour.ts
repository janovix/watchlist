"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import { useLanguage } from "@/components/language-provider";

/** Persisted when the user finishes or closes the home onboarding tour. */
export const WATCHLIST_ONBOARDING_DONE_KEY =
	"janovix_watchlist_onboarding_done";

/**
 * Runs a one-time driver.js tour on the watchlist home search UI.
 * Call with `enabled` when the page is ready (e.g. JWT loaded).
 */
export function useOnboardingTour(enabled: boolean) {
	const { t, language } = useLanguage();
	const tRef = useRef(t);
	tRef.current = t;

	useEffect(() => {
		if (!enabled) return;
		try {
			if (localStorage.getItem(WATCHLIST_ONBOARDING_DONE_KEY) === "true") {
				return;
			}
		} catch {
			return;
		}

		let driverInstance: Driver | null = null;

		const timeoutId = window.setTimeout(() => {
			const tr = tRef.current;
			driverInstance = driver({
				showProgress: true,
				animate: true,
				smoothScroll: true,
				allowClose: true,
				overlayOpacity: 0.6,
				stagePadding: 8,
				stageRadius: 12,
				progressText: tr("tourProgress"),
				nextBtnText: tr("tourNext"),
				prevBtnText: tr("tourPrev"),
				doneBtnText: tr("tourDone"),
				popoverClass: "watchlist-tour-popover",
				onDestroyed: () => {
					try {
						localStorage.setItem(WATCHLIST_ONBOARDING_DONE_KEY, "true");
					} catch {
						/* ignore */
					}
				},
				steps: [
					{
						element: "#entity-type-switch",
						popover: {
							title: tr("tourStep1Title"),
							description: tr("tourStep1Desc"),
							side: "bottom",
						},
					},
					{
						element: "#search-input",
						popover: {
							title: tr("tourStep2Title"),
							description: tr("tourStep2Desc"),
							side: "bottom",
						},
					},
					{
						element: "#advanced-settings-btn",
						popover: {
							title: tr("tourStep3Title"),
							description: tr("tourStep3Desc"),
							side: "bottom",
						},
					},
					{
						element: "#submit-search-btn",
						popover: {
							title: tr("tourStep4Title"),
							description: tr("tourStep4Desc"),
							side: "left",
						},
					},
				],
			});
			driverInstance.drive();
		}, 600);

		return () => {
			window.clearTimeout(timeoutId);
			driverInstance?.destroy();
		};
	}, [enabled, language]);
}
