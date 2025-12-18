import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
	getAuthCoreBaseUrl,
	getAuthAppUrl,
	getAuthBaseURL,
	getAppURL,
} from "./authCoreConfig";

describe("authCoreConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		// Reset env before each test
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("getAuthCoreBaseUrl", () => {
		it("should return the base URL from NEXT_PUBLIC_AUTH_CORE_BASE_URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = "https://auth.example.com";
			expect(getAuthCoreBaseUrl()).toBe("https://auth.example.com");
		});

		it("should return fallback when NEXT_PUBLIC_AUTH_CORE_BASE_URL is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
			expect(getAuthCoreBaseUrl()).toBe("https://auth-svc.example.workers.dev");
		});
	});

	describe("getAuthAppUrl", () => {
		it("should return NEXT_PUBLIC_AUTH_APP_URL when set", () => {
			process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://app.example.com";
			expect(getAuthAppUrl()).toBe("https://app.example.com");
		});

		it("should return fallback when NEXT_PUBLIC_AUTH_APP_URL is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
			expect(getAuthAppUrl()).toBe("https://auth.example.workers.dev");
		});
	});

	describe("getAuthBaseURL (legacy alias)", () => {
		it("should return the base URL from NEXT_PUBLIC_AUTH_CORE_BASE_URL", () => {
			process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = "https://auth.example.com";
			expect(getAuthBaseURL()).toBe("https://auth.example.com");
		});

		it("should return fallback when NEXT_PUBLIC_AUTH_CORE_BASE_URL is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
			expect(getAuthBaseURL()).toBe("https://auth-svc.example.workers.dev");
		});
	});

	describe("getAppURL (legacy alias)", () => {
		it("should return NEXT_PUBLIC_AUTH_APP_URL when set", () => {
			process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://app.example.com";
			expect(getAppURL()).toBe("https://app.example.com");
		});

		it("should return fallback when NEXT_PUBLIC_AUTH_APP_URL is not set", () => {
			delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
			expect(getAppURL()).toBe("https://auth.example.workers.dev");
		});
	});
});
