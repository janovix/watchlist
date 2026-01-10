import { describe, expect, it, vi, beforeEach } from "vitest";
import { cookies } from "next/headers";
import { getJwt } from "./getJwt";
import * as config from "./config";

vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

vi.mock("./config", () => ({
	getAuthCoreBaseUrl: vi.fn(() => "https://auth.example.com"),
	getAuthAppUrl: vi.fn(() => "https://app.example.com"),
}));

// Mock global fetch
global.fetch = vi.fn();

describe("getJwt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return null when no session cookies are present", async () => {
		const mockCookies = {
			toString: vi.fn(() => ""),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as any);

		const result = await getJwt();

		expect(result).toBe(null);
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("should fetch JWT when session cookies are present", async () => {
		const mockCookies = {
			toString: vi.fn(() => "__Secure-better-auth.session_token=test-token"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as any);

		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({ token: "jwt-token-123" }),
		};
		vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

		const result = await getJwt();

		expect(result).toBe("jwt-token-123");
		expect(global.fetch).toHaveBeenCalledWith(
			"https://auth.example.com/api/auth/token",
			expect.objectContaining({
				headers: expect.objectContaining({
					Cookie: "__Secure-better-auth.session_token=test-token",
					Origin: "https://app.example.com",
					Accept: "application/json",
				}),
				cache: "no-store",
			}),
		);
	});

	it("should return null when API response is not ok", async () => {
		const mockCookies = {
			toString: vi.fn(() => "__Secure-better-auth.session_token=test-token"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as any);

		const mockResponse = {
			ok: false,
			status: 401,
			statusText: "Unauthorized",
		};
		vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await getJwt();

		expect(result).toBe(null);
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("should return null when API response has no token", async () => {
		const mockCookies = {
			toString: vi.fn(() => "__Secure-better-auth.session_token=test-token"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as any);

		const mockResponse = {
			ok: true,
			json: vi.fn().mockResolvedValue({}),
		};
		vi.mocked(global.fetch).mockResolvedValue(mockResponse as any);

		const result = await getJwt();

		expect(result).toBe(null);
	});

	it("should handle fetch errors", async () => {
		const mockCookies = {
			toString: vi.fn(() => "__Secure-better-auth.session_token=test-token"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookies as any);

		const mockError = new Error("Network error");
		vi.mocked(global.fetch).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await getJwt();

		expect(result).toBe(null);
		expect(consoleSpy).toHaveBeenCalledWith("Error fetching JWT:", mockError);

		consoleSpy.mockRestore();
	});
});
