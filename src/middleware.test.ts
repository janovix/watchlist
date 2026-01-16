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
			"https://auth.janovix.workers.dev/login",
		);
	});

	it("should allow request when session is valid and user has name", async () => {
		mockGetSessionCookie.mockReturnValue("session-token-123");
		// First call: session validation, Second call: organization list
		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						session: { id: "123" },
						user: { id: "u1", name: "John Doe" },
					}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						organizations: [{ id: "org1", slug: "acme", name: "Acme Inc" }],
						activeOrganizationId: "org1",
					}),
			});

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("location")).toBeNull();
	});

	it("should redirect to onboarding when user has no name", async () => {
		mockGetSessionCookie.mockReturnValue("session-token-123");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					session: { id: "123" },
					user: { id: "u1", name: "" },
				}),
		});
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/onboarding",
		);
		expect(response.headers.get("location")).toContain("redirect_to=");
	});

	it("should redirect to onboarding when user name is null", async () => {
		mockGetSessionCookie.mockReturnValue("session-token-123");
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					session: { id: "123" },
					user: { id: "u1", name: null },
				}),
		});
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		const request = new NextRequest("https://example.com/dashboard");
		const response = await middleware(request);

		expect(response.status).toBe(307);
		expect(response.headers.get("location")).toContain(
			"https://auth.example.com/onboarding",
		);
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

	it("should use X-Forwarded-Host and X-Forwarded-Proto headers for redirect URL", async () => {
		mockGetSessionCookie.mockReturnValue(null);
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.com";

		// Simulate request coming through Caddy proxy
		// Internal URL is localhost:3002 but Caddy forwards the external host
		const request = new NextRequest("http://localhost:3002/dashboard", {
			headers: {
				"x-forwarded-host": "watchlist-local.janovix.workers.dev",
				"x-forwarded-proto": "https",
			},
		});
		const response = await middleware(request);

		const location = response.headers.get("location");
		expect(location).toContain("redirect_to=");
		// Should use the forwarded host, not localhost:3002
		expect(location).toContain(
			encodeURIComponent(
				"https://watchlist-local.janovix.workers.dev/dashboard",
			),
		);
		expect(location).not.toContain("localhost:3002");
	});

	it("should use internal auth service URL when NEXT_PUBLIC_AUTH_SERVICE_URL_INTERNAL is set", async () => {
		mockGetSessionCookie.mockReturnValue("session-token-123");
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL_INTERNAL = "http://localhost:8787";
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
			"https://auth-svc-local.janovix.workers.dev";

		mockFetch
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						session: { id: "123" },
						user: { id: "u1", name: "John Doe" },
					}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						organizations: [{ id: "org1", slug: "acme", name: "Acme Inc" }],
					}),
			});

		const request = new NextRequest("https://example.com/dashboard");
		await middleware(request);

		// Should use internal URL for fetch
		expect(mockFetch).toHaveBeenCalledWith(
			"http://localhost:8787/api/auth/get-session",
			expect.any(Object),
		);
	});
});
