import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	getLocaleForLanguage,
	detectBrowserLanguage,
	translations,
	type Language,
} from "./translations";

describe("translations", () => {
	describe("getLocaleForLanguage", () => {
		it("should return pt-BR for Portuguese", () => {
			expect(getLocaleForLanguage("pt")).toBe("pt-BR");
		});

		it("should return es-ES for Spanish", () => {
			expect(getLocaleForLanguage("es")).toBe("es-ES");
		});

		it("should return en-US for English", () => {
			expect(getLocaleForLanguage("en")).toBe("en-US");
		});
	});

	describe("detectBrowserLanguage", () => {
		let originalNavigator: typeof navigator;

		beforeEach(() => {
			originalNavigator = global.navigator;
		});

		afterEach(() => {
			Object.defineProperty(global, "navigator", {
				value: originalNavigator,
				writable: true,
				configurable: true,
			});
		});

		it("should return 'es' when navigator is undefined (SSR)", () => {
			Object.defineProperty(global, "navigator", {
				value: undefined,
				writable: true,
				configurable: true,
			});

			expect(detectBrowserLanguage()).toBe("es");
		});

		it("should detect Portuguese language", () => {
			Object.defineProperty(global, "navigator", {
				value: {
					language: "pt-BR",
				},
				writable: true,
				configurable: true,
			});

			expect(detectBrowserLanguage()).toBe("pt");
		});

		it("should detect Spanish language", () => {
			Object.defineProperty(global, "navigator", {
				value: {
					language: "es-ES",
				},
				writable: true,
				configurable: true,
			});

			expect(detectBrowserLanguage()).toBe("es");
		});

		it("should detect English language", () => {
			Object.defineProperty(global, "navigator", {
				value: {
					language: "en-US",
				},
				writable: true,
				configurable: true,
			});

			expect(detectBrowserLanguage()).toBe("en");
		});

		it("should default to Spanish for unknown languages", () => {
			Object.defineProperty(global, "navigator", {
				value: {
					language: "fr-FR",
				},
				writable: true,
				configurable: true,
			});

			expect(detectBrowserLanguage()).toBe("es");
		});

		it("should handle lowercase language codes", () => {
			Object.defineProperty(global, "navigator", {
				value: {
					language: "PT-BR",
				},
				writable: true,
				configurable: true,
			});

			expect(detectBrowserLanguage()).toBe("pt");
		});
	});

	describe("translations object", () => {
		it("should have translations for all three languages", () => {
			expect(translations.pt).toBeDefined();
			expect(translations.es).toBeDefined();
			expect(translations.en).toBeDefined();
		});

		it("should have the same keys in all language objects", () => {
			const ptKeys = Object.keys(translations.pt).sort();
			const esKeys = Object.keys(translations.es).sort();
			const enKeys = Object.keys(translations.en).sort();

			expect(ptKeys).toEqual(esKeys);
			expect(esKeys).toEqual(enKeys);
		});

		it("should have appName in all languages", () => {
			expect(translations.pt.appName).toBe("isPep");
			expect(translations.es.appName).toBe("isPep");
			expect(translations.en.appName).toBe("isPep");
		});

		it("should have byJanovix in all languages", () => {
			expect(translations.pt.byJanovix).toBe("Janovix");
			expect(translations.es.byJanovix).toBe("Janovix");
			expect(translations.en.byJanovix).toBe("Janovix");
		});
	});
});
