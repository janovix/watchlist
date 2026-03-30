import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useTranslation } from "./useTranslation";
import { SettingsProvider } from "./SettingsProvider";
import { DEFAULT_SETTINGS } from "./types";
import type { ResolvedSettings } from "./types";
import { translations } from "../translations";

// Cleanup after each test
beforeEach(() => {
	cleanup();
});

// Test component that uses the translation hook
function TranslationConsumer() {
	const { t, language, translations: trans } = useTranslation();

	return (
		<div>
			<span data-testid="language">{language}</span>
			<span data-testid="appName">{t("appName")}</span>
			<span data-testid="heroTitle">{t("heroTitle")}</span>
			<span data-testid="searchButton">{t("searchButton")}</span>
			<span data-testid="hasTranslations">{trans ? "yes" : "no"}</span>
		</div>
	);
}

describe("useTranslation", () => {
	describe("with Spanish settings", () => {
		it("should return Spanish translations", () => {
			const serverSettings: ResolvedSettings = {
				...DEFAULT_SETTINGS,
				language: "es",
			};

			render(
				<SettingsProvider serverSettings={serverSettings}>
					<TranslationConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("language")).toHaveTextContent("es");
			expect(screen.getByTestId("appName")).toHaveTextContent(
				translations.es.appName,
			);
			expect(screen.getByTestId("heroTitle")).toHaveTextContent(
				translations.es.heroTitle,
			);
			expect(screen.getByTestId("searchButton")).toHaveTextContent(
				translations.es.searchButton,
			);
		});
	});

	describe("with English settings", () => {
		it("should return English translations", () => {
			const serverSettings: ResolvedSettings = {
				...DEFAULT_SETTINGS,
				language: "en",
			};

			render(
				<SettingsProvider serverSettings={serverSettings}>
					<TranslationConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("language")).toHaveTextContent("en");
			expect(screen.getByTestId("appName")).toHaveTextContent(
				translations.en.appName,
			);
			expect(screen.getByTestId("heroTitle")).toHaveTextContent(
				translations.en.heroTitle,
			);
			expect(screen.getByTestId("searchButton")).toHaveTextContent(
				translations.en.searchButton,
			);
		});
	});

	describe("without provider", () => {
		it("should use default language (Spanish) when outside provider", () => {
			render(<TranslationConsumer />);

			// Default language is es
			expect(screen.getByTestId("language")).toHaveTextContent("es");
			expect(screen.getByTestId("appName")).toHaveTextContent(
				translations.es.appName,
			);
		});
	});

	describe("translation function", () => {
		it("should provide access to the translations object", () => {
			render(
				<SettingsProvider serverSettings={DEFAULT_SETTINGS}>
					<TranslationConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("hasTranslations")).toHaveTextContent("yes");
		});

		it("should return the key when translation is missing", () => {
			function FallbackKeyConsumer() {
				const { t } = useTranslation();
				const looseT = t as (key: string) => string;
				return (
					<span data-testid="fallback">{looseT("nonexistent.key.xyz")}</span>
				);
			}

			render(
				<SettingsProvider serverSettings={DEFAULT_SETTINGS}>
					<FallbackKeyConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("fallback")).toHaveTextContent(
				"nonexistent.key.xyz",
			);
		});
	});
});
