import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("config", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	describe("getAuthCoreBaseUrl", () => {
		it("should return env value when set", async () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = "https://custom-auth.com";
			const { getAuthCoreBaseUrl } = await import("./config");
			expect(getAuthCoreBaseUrl()).toBe("https://custom-auth.com");
		});

		it("should throw when env not set", async () => {
			delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
			const { getAuthCoreBaseUrl } = await import("./config");
			expect(() => getAuthCoreBaseUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_AUTH_SERVICE_URL",
			);
		});
	});

	describe("getAuthAppUrl", () => {
		it("should return env value when set", async () => {
			process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://custom-app.com";
			const { getAuthAppUrl } = await import("./config");
			expect(getAuthAppUrl()).toBe("https://custom-app.com");
		});

		it("should throw when env not set", async () => {
			delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
			const { getAuthAppUrl } = await import("./config");
			expect(() => getAuthAppUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_AUTH_APP_URL",
			);
		});
	});

	describe("getAuthCoreServerUrl", () => {
		it("should return env value when set", async () => {
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = "https://server-auth.example";
			const { getAuthCoreServerUrl } = await import("./config");
			expect(getAuthCoreServerUrl()).toBe("https://server-auth.example");
		});

		it("should throw when env not set", async () => {
			delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
			const { getAuthCoreServerUrl } = await import("./config");
			expect(() => getAuthCoreServerUrl()).toThrow(
				"Missing required environment variable: NEXT_PUBLIC_AUTH_SERVICE_URL",
			);
		});
	});
});
