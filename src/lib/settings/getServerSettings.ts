"use server";

import { cookies, headers } from "next/headers";
import { getAuthCoreServerUrl, getAuthAppUrl } from "../auth/config";
import type { ResolvedSettings, LanguageCode, Theme } from "./types";
import { DEFAULT_SETTINGS } from "./types";

/**
 * Extract browser hints from request headers
 */
function extractBrowserHints(requestHeaders: Headers): {
	timezone?: string;
	language?: string;
	theme?: string;
} {
	const acceptLanguage = requestHeaders.get("accept-language");
	const language = acceptLanguage?.split(",")[0]?.split("-")[0];

	// Map common language codes to our supported languages
	let mappedLanguage: string | undefined;
	if (language) {
		if (language.startsWith("es")) mappedLanguage = "es";
		else if (language.startsWith("en")) mappedLanguage = "en";
	}

	// Cloudflare provides timezone in CF-Timezone header
	const timezone = requestHeaders.get("cf-timezone") ?? undefined;

	return {
		timezone,
		language: mappedLanguage,
		// Theme is typically detected client-side via prefers-color-scheme
	};
}

/**
 * Fetch resolved user settings from auth-svc (server-side)
 *
 * This function calls the internal settings endpoint with browser hints
 * to get the properly resolved settings (user > org > browser > default)
 */
export async function getServerSettings(): Promise<ResolvedSettings> {
	try {
		const cookieStore = await cookies();
		const cookieHeader = cookieStore.toString();

		// Check if user is logged in
		if (!cookieHeader.includes("better-auth.session_token")) {
			return getDefaultSettingsFromHeaders();
		}

		const requestHeaders = await headers();
		const browserHints = extractBrowserHints(requestHeaders);

		// Build query params for browser hints
		const params = new URLSearchParams();
		if (browserHints.timezone)
			params.set("browserTimezone", browserHints.timezone);
		if (browserHints.language)
			params.set("browserLanguage", browserHints.language);
		if (browserHints.theme) params.set("browserTheme", browserHints.theme);

		const url = new URL("/api/settings/resolved", getAuthCoreServerUrl());
		url.search = params.toString();

		const response = await fetch(url.toString(), {
			headers: {
				Cookie: cookieHeader,
				Origin: getAuthAppUrl(),
			},
			cache: "no-store",
		});

		if (!response.ok) {
			console.error(
				"Failed to fetch settings from auth-svc:",
				response.status,
				response.statusText,
			);
			return getDefaultSettingsFromHeaders();
		}

		const data = (await response.json()) as ResolvedSettings;
		return data;
	} catch (error) {
		console.error("Error fetching server settings:", error);
		return getDefaultSettingsFromHeaders();
	}
}

/**
 * Get default settings using browser headers when auth-svc is unavailable
 */
async function getDefaultSettingsFromHeaders(): Promise<ResolvedSettings> {
	try {
		const requestHeaders = await headers();
		const browserHints = extractBrowserHints(requestHeaders);

		const settings: ResolvedSettings = { ...DEFAULT_SETTINGS };

		if (browserHints.language) {
			settings.language = browserHints.language as LanguageCode;
			settings.sources.language = "browser";
		}

		if (browserHints.timezone) {
			settings.timezone = browserHints.timezone;
			settings.sources.timezone = "browser";
		}

		if (browserHints.theme) {
			settings.theme = browserHints.theme as Theme;
			settings.sources.theme = "browser";
		}

		return settings;
	} catch {
		return DEFAULT_SETTINGS;
	}
}
