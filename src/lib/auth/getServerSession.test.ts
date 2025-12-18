import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cookies } from "next/headers";
import { getServerSession } from "./getServerSession";
import type { Session } from "./types";

// Mock next/headers
vi.mock("next/headers", () => ({
	cookies: vi.fn(),
}));

describe("getServerSession", () => {
	const mockSession: Session = {
		user: {
			id: "user-1",
			name: "Test User",
			email: "test@example.com",
			image: null,
			emailVerified: true,
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-02"),
		},
		session: {
			id: "session-1",
			userId: "user-1",
			token: "token-123",
			expiresAt: new Date("2024-12-31"),
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-02"),
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL = "https://auth.example.com";
		process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://app.example.com";
	});

	afterEach(() => {
		delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
		delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
	});

	it("should return null if no session token cookie is present", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("other-cookie=value"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		const result = await getServerSession();

		expect(result).toBeNull();
	});

	it("should return null if NEXT_PUBLIC_AUTH_CORE_BASE_URL is not set", async () => {
		delete process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		const result = await getServerSession();

		expect(result).toBeNull();
	});

	it("should fetch and return session successfully", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: {
					...mockSession.user,
					createdAt: mockSession.user.createdAt.toISOString(),
					updatedAt: mockSession.user.updatedAt.toISOString(),
				},
				session: {
					...mockSession.session,
					expiresAt: mockSession.session.expiresAt.toISOString(),
					createdAt: mockSession.session.createdAt.toISOString(),
					updatedAt: mockSession.session.updatedAt.toISOString(),
				},
			}),
		});

		const result = await getServerSession();

		expect(result).toBeDefined();
		expect(result?.user.id).toBe("user-1");
		expect(result?.session.id).toBe("session-1");
		expect(global.fetch).toHaveBeenCalledWith(
			"https://auth.example.com/api/auth/get-session",
			expect.objectContaining({
				headers: expect.objectContaining({
					Cookie: "better-auth.session_token=abc123",
					Origin: "https://app.example.com",
				}),
				cache: "no-store",
			}),
		);
	});

	it("should return null if fetch response is not ok", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
		});

		const result = await getServerSession();

		expect(result).toBeNull();
	});

	it("should return null if response data is missing user or session", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: mockSession.user,
				// Missing session
			}),
		});

		const result = await getServerSession();

		expect(result).toBeNull();
	});

	it("should handle fetch errors gracefully", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const result = await getServerSession();

		expect(result).toBeNull();
		expect(consoleErrorSpy).toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});

	it("should normalize image field from undefined to null", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: {
					...mockSession.user,
					image: undefined, // Should be normalized to null
					createdAt: mockSession.user.createdAt.toISOString(),
					updatedAt: mockSession.user.updatedAt.toISOString(),
				},
				session: {
					...mockSession.session,
					expiresAt: mockSession.session.expiresAt.toISOString(),
					createdAt: mockSession.session.createdAt.toISOString(),
					updatedAt: mockSession.session.updatedAt.toISOString(),
				},
			}),
		});

		const result = await getServerSession();

		expect(result?.user.image).toBeNull();
	});

	it("should use NEXT_PUBLIC_VERCEL_URL when NEXT_PUBLIC_AUTH_APP_URL is not set", async () => {
		delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
		process.env.NEXT_PUBLIC_VERCEL_URL = "https://vercel.example.com";

		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: {
					...mockSession.user,
					createdAt: mockSession.user.createdAt.toISOString(),
					updatedAt: mockSession.user.updatedAt.toISOString(),
				},
				session: {
					...mockSession.session,
					expiresAt: mockSession.session.expiresAt.toISOString(),
					createdAt: mockSession.session.createdAt.toISOString(),
					updatedAt: mockSession.session.updatedAt.toISOString(),
				},
			}),
		});

		await getServerSession();

		expect(global.fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: expect.objectContaining({
					Origin: "https://vercel.example.com",
				}),
			}),
		);

		delete process.env.NEXT_PUBLIC_VERCEL_URL;
	});

	it("should handle Date objects in response (not just ISO strings)", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: {
					...mockSession.user,
					createdAt: mockSession.user.createdAt, // Already a Date
					updatedAt: mockSession.user.updatedAt, // Already a Date
				},
				session: {
					...mockSession.session,
					expiresAt: mockSession.session.expiresAt, // Already a Date
					createdAt: mockSession.session.createdAt, // Already a Date
					updatedAt: mockSession.session.updatedAt, // Already a Date
				},
			}),
		});

		const result = await getServerSession();

		expect(result).toBeDefined();
		expect(result?.user.createdAt).toBeInstanceOf(Date);
	});

	it("should handle ipAddress and userAgent being null", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: {
					...mockSession.user,
					createdAt: mockSession.user.createdAt.toISOString(),
					updatedAt: mockSession.user.updatedAt.toISOString(),
				},
				session: {
					...mockSession.session,
					ipAddress: null,
					userAgent: null,
					expiresAt: mockSession.session.expiresAt.toISOString(),
					createdAt: mockSession.session.createdAt.toISOString(),
					updatedAt: mockSession.session.updatedAt.toISOString(),
				},
			}),
		});

		const result = await getServerSession();

		// getServerSession doesn't normalize null to undefined, it preserves null
		expect(result?.session.ipAddress).toBeNull();
		expect(result?.session.userAgent).toBeNull();
	});

	it("should return null if response has user but no session", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				user: mockSession.user,
				// Missing session
			}),
		});

		const result = await getServerSession();

		expect(result).toBeNull();
	});

	it("should return null if response has session but no user", async () => {
		const mockCookieStore = {
			toString: vi.fn().mockReturnValue("better-auth.session_token=abc123"),
		};
		vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				session: mockSession.session,
				// Missing user
			}),
		});

		const result = await getServerSession();

		expect(result).toBeNull();
	});
});
