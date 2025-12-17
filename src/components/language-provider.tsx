"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";
import {
	type Language,
	translations,
	detectBrowserLanguage,
} from "@/lib/translations";

type TranslationKeys = keyof (typeof translations)["es"];

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<Language>("es");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Check localStorage first, then browser language
		const stored = localStorage.getItem("language") as Language | null;
		if (stored && ["pt", "es", "en"].includes(stored)) {
			setLanguageState(stored);
		} else {
			const detected = detectBrowserLanguage();
			setLanguageState(detected);
			localStorage.setItem("language", detected);
		}
	}, []);

	const setLanguage = (lang: Language) => {
		setLanguageState(lang);
		localStorage.setItem("language", lang);
	};

	const t = (key: TranslationKeys): string => {
		return translations[language][key] || key;
	};

	// Return default context during SSR
	if (!mounted) {
		return (
			<LanguageContext.Provider
				value={{
					language: "es",
					setLanguage: () => {},
					t: (key) => translations["es"][key] || key,
				}}
			>
				{children}
			</LanguageContext.Provider>
		);
	}

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
