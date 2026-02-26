import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getServerSettings } from "./getServerSettings";
import { DEFAULT_SETTINGS } from "./types";

// Mock next/headers
vi.mock("next/headers", () => ({
	cookies: vi.fn(),
	headers: vi.fn(),
}));

// Mock config
vi.mock("../auth/config", () => ({
	getAuthCoreBaseUrl: vi.fn(() => "https://auth-svc.test.workers.dev"),
	getAuthCoreServerUrl: vi.fn(() => "https://auth-svc.test.workers.dev"),
	getAuthAppUrl: vi.fn(() => "https://auth.test.workers.dev"),
}));

// Import mocked modules
import { cookies, headers } from "next/headers";

describe("getServerSettings", () => {
	const mockCookies = vi.mocked(cookies);
	const mockHeaders = vi.mocked(headers);

	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should return default settings when no session cookie exists", async () => {
		const mockCookieStore = {
			toString: () => "",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "es-ES,es;q=0.9");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const settings = await getServerSettings();

		expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
		expect(settings.sources.theme).toBe("default");
	});

	it("should detect Spanish language from browser headers", async () => {
		const mockCookieStore = {
			toString: () => "",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "es-MX,es;q=0.9,en;q=0.8");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const settings = await getServerSettings();

		expect(settings.language).toBe("es");
		expect(settings.sources.language).toBe("browser");
	});

	it("should detect English language from browser headers", async () => {
		const mockCookieStore = {
			toString: () => "",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "en-US,en;q=0.9");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const settings = await getServerSettings();

		expect(settings.language).toBe("en");
		expect(settings.sources.language).toBe("browser");
	});

	it("should default to Spanish for unsupported languages from browser headers", async () => {
		const mockCookieStore = {
			toString: () => "",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "pt-BR,pt;q=0.9");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const settings = await getServerSettings();

		expect(settings.language).toBe("es");
		expect(settings.sources.language).toBe("browser");
	});

	it("should detect timezone from CF-Timezone header", async () => {
		const mockCookieStore = {
			toString: () => "",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("cf-timezone", "America/Mexico_City");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const settings = await getServerSettings();

		expect(settings.timezone).toBe("America/Mexico_City");
		expect(settings.sources.timezone).toBe("browser");
	});

	it("should fetch settings from auth-svc when session exists", async () => {
		const mockCookieStore = {
			toString: () => "better-auth.session_token=abc123",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "es-MX");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({
				theme: "dark",
				timezone: "America/Mexico_City",
				language: "es",
				dateFormat: "DD/MM/YYYY",
				avatarUrl: "https://example.com/avatar.jpg",
				sources: {
					theme: "user",
					timezone: "user",
					language: "user",
					dateFormat: "user",
				},
			}),
		};
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const settings = await getServerSettings();

		expect(settings.theme).toBe("dark");
		expect(settings.sources.theme).toBe("user");
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/settings/resolved"),
			expect.objectContaining({
				headers: expect.objectContaining({
					Cookie: "better-auth.session_token=abc123",
				}),
			}),
		);
	});

	it("should return defaults when auth-svc returns error", async () => {
		const mockCookieStore = {
			toString: () => "better-auth.session_token=abc123",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "es-MX");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const mockResponse = {
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		};
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		const settings = await getServerSettings();

		expect(settings.language).toBe("es");
		expect(settings.sources.language).toBe("browser");
	});

	it("should return defaults when fetch throws", async () => {
		const mockCookieStore = {
			toString: () => "better-auth.session_token=abc123",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("Network error"),
		);

		const settings = await getServerSettings();

		expect(settings).toEqual(DEFAULT_SETTINGS);
	});

	it("should include browser hints in query params when fetching", async () => {
		const mockCookieStore = {
			toString: () => "better-auth.session_token=abc123",
		};
		mockCookies.mockResolvedValue(mockCookieStore as never);

		const mockHeadersObj = new Headers();
		mockHeadersObj.set("accept-language", "en-US");
		mockHeadersObj.set("cf-timezone", "America/New_York");
		mockHeaders.mockResolvedValue(mockHeadersObj as never);

		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue(DEFAULT_SETTINGS),
		};
		(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

		await getServerSettings();

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringMatching(/browserLanguage=en/),
			expect.anything(),
		);
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringMatching(/browserTimezone=America%2FNew_York/),
			expect.anything(),
		);
	});
});
