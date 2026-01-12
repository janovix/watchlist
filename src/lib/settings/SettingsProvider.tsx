"use client";

import * as React from "react";
import type { ResolvedSettings, LanguageCode, Theme } from "./types";
import { DEFAULT_SETTINGS } from "./types";

/**
 * Settings context value
 */
interface SettingsContextValue {
	settings: ResolvedSettings;
	language: LanguageCode;
	theme: Theme;
	timezone: string;
	dateFormat: string;
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(
	undefined,
);

/**
 * Hook to access the current settings
 */
export function useSettings(): SettingsContextValue {
	const context = React.useContext(SettingsContext);
	if (context === undefined) {
		// Return defaults if used outside provider
		return {
			settings: DEFAULT_SETTINGS,
			language: DEFAULT_SETTINGS.language,
			theme: DEFAULT_SETTINGS.theme,
			timezone: DEFAULT_SETTINGS.timezone,
			dateFormat: DEFAULT_SETTINGS.dateFormat,
		};
	}
	return context;
}

/**
 * Hook to get the current language
 */
export function useLanguage(): LanguageCode {
	return useSettings().language;
}

/**
 * Hook to get the current timezone
 */
export function useTimezone(): string {
	return useSettings().timezone;
}

/**
 * Props for the SettingsProvider
 */
interface SettingsProviderProps {
	children: React.ReactNode;
	serverSettings: ResolvedSettings | null;
}

/**
 * Provider that hydrates settings from the server
 */
export function SettingsProvider({
	children,
	serverSettings,
}: SettingsProviderProps): React.ReactElement {
	const settings = serverSettings ?? DEFAULT_SETTINGS;

	const value = React.useMemo<SettingsContextValue>(
		() => ({
			settings,
			language: settings.language,
			theme: settings.theme,
			timezone: settings.timezone,
			dateFormat: settings.dateFormat,
		}),
		[settings],
	);

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
}
