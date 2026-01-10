import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// Mock better-auth/cookies
const mockGetSessionCookie = vi.fn();
vi.mock("better-auth/cookies", () => ({
	getSessionCookie: (request: NextRequest) => mockGetSessionCookie(request),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("middleware", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should redirect to auth app when no session cookie", async () => {
		mockGetSessionCookie.mockReturnValue(null);
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(307); // Redirect status
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/login",
		);
		expect(response.headers.get("location")).toContain("redirect_to=");
		expect(response.headers.get("location")).toContain(
			encodeURIComponent("https://example.com/dashboard"),
		);
	});

	it("should use fallback auth URL when env var is not set", async () => {
		mockGetSessionCookie.mockReturnValue(null);
		delete process.env.NEXT_PUBLIC_AUTH_APP_URL;

		const request = new NextRequest("https://example.com/page");
		const response = await middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.workers.dev/login",
		);
	});

	it("should allow request when session is valid", async () => {
		mockGetSessionCookie.mockReturnValue("session-token-123");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({ session: { id: "123" }, user: { id: "u1" } }),
		});

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("location")).toBeNull();
	});

	it("should redirect when session validation fails", async () => {
		mockGetSessionCookie.mockReturnValue("invalid-session");
		mockFetch.mockResolvedValue({
			ok: false,
			json: () => Promise.resolve({}),
		});
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/login",
		);
	});

	it("should redirect when session data is missing", async () => {
		mockGetSessionCookie.mockReturnValue("session-token");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}), // No session or user data
		});
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/login",
		);
	});

	it("should redirect when fetch throws an error", async () => {
		mockGetSessionCookie.mockReturnValue("session-token");
		mockFetch.mockRejectedValue(new Error("Network error"));
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/login",
		);
	});

	it("should encode return URL properly", async () => {
		mockGetSessionCookie.mockReturnValue(null);
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest(
			"https://example.com/page?query=test&other=value",
		);
		const response = await middleware(request);

		const location = response.headers.get("location");
		expect(location).toContain("redirect_to=");
		expect(location).toContain(
			encodeURIComponent("https://example.com/page?query=test&other=value"),
		);
	});
});
