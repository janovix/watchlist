import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// Mock better-auth/cookies
const mockGetSessionCookie = vi.fn();
vi.mock("better-auth/cookies", () => ({
	getSessionCookie: (request: NextRequest) => mockGetSessionCookie(request),
}));

describe("middleware", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should redirect to auth app when no session cookie", () => {
		mockGetSessionCookie.mockReturnValue(null);
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = middleware(request);

		expect(response.status).toBe(307); // Redirect status
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/login",
		);
		expect(response.headers.get("location")).toContain("redirect_to=");
		expect(response.headers.get("location")).toContain(
			encodeURIComponent("https://example.com/dashboard"),
		);
	});

	it("should use fallback auth URL when env var is not set", () => {
		mockGetSessionCookie.mockReturnValue(null);
		delete process.env.NEXT_PUBLIC_AUTH_APP_URL;

		const request = new NextRequest("https://example.com/page");
		const response = middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.workers.dev/login",
		);
	});

	it("should allow request when session cookie exists", () => {
		mockGetSessionCookie.mockReturnValue("session-token-123");

		const request = new NextRequest("https://example.com/dashboard");
		const response = middleware(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("location")).toBeNull();
	});

	it("should encode return URL properly", () => {
		mockGetSessionCookie.mockReturnValue(null);
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest(
			"https://example.com/page?query=test&other=value",
		);
		const response = middleware(request);

		const location = response.headers.get("location");
		expect(location).toContain("redirect_to=");
		expect(location).toContain(
			encodeURIComponent("https://example.com/page?query=test&other=value"),
		);
	});
});
