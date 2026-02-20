import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS } from "./types";
import type {
	Theme,
	DateFormat,
	LanguageCode,
	ResolvedSettings,
} from "./types";

describe("Settings types", () => {
	describe("DEFAULT_SETTINGS", () => {
		it("should have correct default values", () => {
			expect(DEFAULT_SETTINGS.theme).toBe("system");
			expect(DEFAULT_SETTINGS.timezone).toBe("UTC");
			expect(DEFAULT_SETTINGS.language).toBe("es");
			expect(DEFAULT_SETTINGS.dateFormat).toBe("DD/MM/YYYY");
			expect(DEFAULT_SETTINGS.avatarUrl).toBeNull();
		});

		it("should have all sources set to default", () => {
			expect(DEFAULT_SETTINGS.sources.theme).toBe("default");
			expect(DEFAULT_SETTINGS.sources.timezone).toBe("default");
			expect(DEFAULT_SETTINGS.sources.language).toBe("default");
			expect(DEFAULT_SETTINGS.sources.dateFormat).toBe("default");
		});
	});

	describe("Type definitions", () => {
		it("should allow valid theme values", () => {
			const themes: Theme[] = ["light", "dark", "system"];
			themes.forEach((theme) => {
				expect(typeof theme).toBe("string");
			});
		});

		it("should allow valid date format values", () => {
			const dateFormats: DateFormat[] = [
				"MM/DD/YYYY",
				"DD/MM/YYYY",
				"YYYY-MM-DD",
				"DD.MM.YYYY",
			];
			dateFormats.forEach((format) => {
				expect(typeof format).toBe("string");
			});
		});

		it("should allow valid language code values", () => {
			const languages: LanguageCode[] = ["en", "es"];
			languages.forEach((lang) => {
				expect(typeof lang).toBe("string");
			});
		});

		it("should allow valid resolved settings", () => {
			const settings: ResolvedSettings = {
				theme: "dark",
				timezone: "America/Mexico_City",
				language: "es",
				dateFormat: "DD/MM/YYYY",
				avatarUrl: "https://example.com/avatar.jpg",
				sources: {
					theme: "user",
					timezone: "browser",
					language: "organization",
					dateFormat: "default",
				},
			};

			expect(settings.theme).toBe("dark");
			expect(settings.timezone).toBe("America/Mexico_City");
			expect(settings.language).toBe("es");
			expect(settings.dateFormat).toBe("DD/MM/YYYY");
			expect(settings.avatarUrl).toBe("https://example.com/avatar.jpg");
		});
	});
});
