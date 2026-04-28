"use client";

import { useEffect, useRef } from "react";
import { driver, type Driver } from "driver.js";
import { useLanguage } from "@/components/language-provider";

/** Persisted when the user finishes or closes the home onboarding tour. */
export const WATCHLIST_ONBOARDING_DONE_KEY =
	"janovix_watchlist_onboarding_done";

/**
 * Runs a one-time driver.js tour on the watchlist home search UI.
 * Call with `enabled` when the page is ready (e.g. JWT loaded and not loading).
 *
 * Skipped when:
 * - Playwright / automation (`navigator.webdriver === true`), unless `?tour=force`
 * - `?e2e=1` or `?tour=skip`, unless `?tour=force`
 * - {@link WATCHLIST_ONBOARDING_DONE_KEY} is set in localStorage, unless `?tour=force`
 *
 * `?tour=force` bypasses the above so E2E can walk the tour deliberately.
 */
export function useOnboardingTour(enabled: boolean) {
	const { t, language } = useLanguage();
	const tRef = useRef(t);
	const driverRef = useRef<Driver | null>(null);
	const teardownRef = useRef(false);
	tRef.current = t;

	useEffect(() => {
		teardownRef.current = false;
		if (!enabled) return;

		let force = false;
		try {
			const params = new URLSearchParams(window.location.search);
			force = params.get("tour") === "force";
			if (
				!force &&
				(params.get("e2e") === "1" || params.get("tour") === "skip")
			) {
				return;
			}
		} catch {
			/* ignore */
		}

		if (
			!force &&
			typeof navigator !== "undefined" &&
			navigator.webdriver === true
		) {
			return;
		}

		if (!force) {
			try {
				if (localStorage.getItem(WATCHLIST_ONBOARDING_DONE_KEY) === "true") {
					return;
				}
			} catch {
				return;
			}
		}

		let cancelled = false;
		const timeoutId = window.setTimeout(() => {
			if (cancelled) return;

			const tr = tRef.current;
			const dObj = driver({
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
					if (teardownRef.current) {
						driverRef.current = null;
						return;
					}
					try {
						localStorage.setItem(WATCHLIST_ONBOARDING_DONE_KEY, "true");
					} catch {
						/* ignore */
					}
					driverRef.current = null;
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

			driverRef.current = dObj;
			dObj.drive();
		}, 600);

		return () => {
			cancelled = true;
			window.clearTimeout(timeoutId);
			teardownRef.current = true;
			driverRef.current?.destroy();
			driverRef.current = null;
		};
	}, [enabled, language]);
}
