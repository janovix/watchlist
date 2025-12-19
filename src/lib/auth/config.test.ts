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

		it("should return default when env not set", async () => {
			delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
			const { getAuthCoreBaseUrl } = await import("./config");
			expect(getAuthCoreBaseUrl()).toBe("https://auth-svc.example.workers.dev");
		});
	});

	describe("getAuthAppUrl", () => {
		it("should return env value when set", async () => {
			process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://custom-app.com";
			const { getAuthAppUrl } = await import("./config");
			expect(getAuthAppUrl()).toBe("https://custom-app.com");
		});

		it("should return default when env not set", async () => {
			delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
			const { getAuthAppUrl } = await import("./config");
			expect(getAuthAppUrl()).toBe("https://auth.example.workers.dev");
		});
	});
});
