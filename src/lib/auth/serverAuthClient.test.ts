import { describe, it, expect, vi, beforeEach } from "vitest";

type OnRequest = (ctx: { headers: Headers }) => Promise<void>;

const captured: { baseURL?: string; onRequest?: OnRequest } = {};

vi.mock("better-auth/client", () => ({
	createAuthClient: (config: {
		baseURL: string;
		fetchOptions: { onRequest?: OnRequest };
	}) => {
		captured.baseURL = config.baseURL;
		captured.onRequest = config.fetchOptions.onRequest;
		return { __mockServerAuthClient: true };
	},
	jwtClient: vi.fn(() => ({ id: "jwt" })),
	organizationClient: vi.fn(() => ({ id: "org" })),
}));

vi.mock("./config", () => ({
	getAuthCoreBaseUrl: vi.fn(() => "https://auth-core.example"),
	getAuthAppUrl: vi.fn(() => "https://auth-app.example"),
}));

const mockCookies = vi.fn();

vi.mock("next/headers", () => ({
	cookies: () => mockCookies(),
}));

describe("serverAuthClient", () => {
	beforeEach(() => {
		vi.resetModules();
		captured.baseURL = undefined;
		captured.onRequest = undefined;
		mockCookies.mockReset();
	});

	it("creates client with auth core base URL", async () => {
		await import("./serverAuthClient");
		expect(captured.baseURL).toBe("https://auth-core.example");
	});

	it("onRequest sets cookie header when cookie store is non-empty", async () => {
		mockCookies.mockResolvedValue({
			toString: () => "session=abc; Path=/",
		});
		await import("./serverAuthClient");
		const headers = new Headers();
		await captured.onRequest!({ headers });
		expect(headers.get("cookie")).toBe("session=abc; Path=/");
		expect(headers.get("origin")).toBe("https://auth-app.example");
	});

	it("onRequest skips cookie header when empty", async () => {
		mockCookies.mockResolvedValue({
			toString: () => "",
		});
		vi.resetModules();
		await import("./serverAuthClient");
		const headers = new Headers();
		await captured.onRequest!({ headers });
		expect(headers.get("cookie")).toBeNull();
		expect(headers.get("origin")).toBe("https://auth-app.example");
	});
});
