"use client";

import { translations, type Language } from "../translations";
import { useLanguage } from "./SettingsProvider";

type TranslationKey = keyof (typeof translations)["en"];

/**
 * Hook to get translations based on user settings
 *
 * @returns Translation function and current language
 */
export function useTranslation() {
	const language = useLanguage();

	// Map settings language to translations language
	const lang: Language =
		language === "pt" ? "pt" : language === "en" ? "en" : "es";
	const t = translations[lang];

	/**
	 * Get a translated string by key
	 */
	const translate = (key: TranslationKey): string => {
		return t[key] ?? key;
	};

	return {
		t: translate,
		language: lang,
		translations: t,
	};
}
