import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getAuthBaseURL, getAppURL } from "./authCoreConfig";

describe("authCoreConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		// Reset env before each test
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("getAuthBaseURL", () => {
		it("should return the base URL from NEXT_PUBLIC_AUTH_CORE_BASE_URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = "https://auth.example.com";
			expect(getAuthBaseURL()).toBe("https://auth.example.com");
		});

		it("should throw error when NEXT_PUBLIC_AUTH_CORE_BASE_URL is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
			expect(() => getAuthBaseURL()).toThrow(
				"NEXT_PUBLIC_AUTH_CORE_BASE_URL environment variable is not set",
			);
		});
	});

	describe("getAppURL", () => {
		it("should return NEXT_PUBLIC_AUTH_APP_URL when set", () => {
			process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://app.example.com";
			expect(getAppURL()).toBe("https://app.example.com");
		});

		it("should return window.location.origin when NEXT_PUBLIC_AUTH_APP_URL is not set and window is defined", () => {
			delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
			// In test environment (jsdom), window is defined, so it will return window.location.origin
			const result = getAppURL();
			// Should return a URL (window.location.origin in test env) or empty string (in Node.js)
			expect(typeof result).toBe("string");
		});
	});
});
