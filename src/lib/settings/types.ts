/**
 * Settings types for the watchlist frontend
 */

export type Theme = "light" | "dark" | "system";
export type DateFormat =
	| "MM/DD/YYYY"
	| "DD/MM/YYYY"
	| "YYYY-MM-DD"
	| "DD.MM.YYYY";
export type LanguageCode = "en" | "es" | "pt";

/**
 * Resolved settings from auth-svc
 */
export interface ResolvedSettings {
	theme: Theme;
	timezone: string;
	language: LanguageCode;
	dateFormat: DateFormat;
	avatarUrl: string | null;
	sources: {
		theme: "user" | "organization" | "browser" | "default";
		timezone: "user" | "organization" | "browser" | "default";
		language: "user" | "organization" | "browser" | "default";
		dateFormat: "user" | "organization" | "default";
	};
}

/**
 * Default settings when auth-svc is unavailable
 */
export const DEFAULT_SETTINGS: ResolvedSettings = {
	theme: "system",
	timezone: "UTC",
	language: "es",
	dateFormat: "DD/MM/YYYY",
	avatarUrl: null,
	sources: {
		theme: "default",
		timezone: "default",
		language: "default",
		dateFormat: "default",
	},
};
