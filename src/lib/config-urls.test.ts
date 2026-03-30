import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("config-urls", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("getPrivacyUrl", () => {
		it("returns trimmed value from NEXT_PUBLIC_PRIVACY_URL", async () => {
			process.env.NEXT_PUBLIC_PRIVACY_URL = "https://example.com/privacy/";
			const { getPrivacyUrl } = await import("./config-urls");
			expect(getPrivacyUrl()).toBe("https://example.com/privacy");
		});

		it("throws when unset", async () => {
			delete process.env.NEXT_PUBLIC_PRIVACY_URL;
			const { getPrivacyUrl } = await import("./config-urls");
			expect(() => getPrivacyUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_PRIVACY_URL",
			);
		});
	});

	describe("getTermsUrl", () => {
		it("returns value from NEXT_PUBLIC_TERMS_URL", async () => {
			process.env.NEXT_PUBLIC_TERMS_URL = "https://legal.example/terms";
			const { getTermsUrl } = await import("./config-urls");
			expect(getTermsUrl()).toBe("https://legal.example/terms");
		});

		it("throws when unset", async () => {
			delete process.env.NEXT_PUBLIC_TERMS_URL;
			const { getTermsUrl } = await import("./config-urls");
			expect(() => getTermsUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_TERMS_URL",
			);
		});
	});

	describe("getHomepageUrl", () => {
		it("returns value from NEXT_PUBLIC_HOMEPAGE_URL", async () => {
			process.env.NEXT_PUBLIC_HOMEPAGE_URL = "https://home.example/";
			const { getHomepageUrl } = await import("./config-urls");
			expect(getHomepageUrl()).toBe("https://home.example");
		});

		it("throws when unset", async () => {
			delete process.env.NEXT_PUBLIC_HOMEPAGE_URL;
			const { getHomepageUrl } = await import("./config-urls");
			expect(() => getHomepageUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_HOMEPAGE_URL",
			);
		});
	});
});
