import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { Session } from "./types";

// Mock dependencies before imports
vi.mock("./authClient", () => ({
	authClient: {
		signIn: {
			email: vi.fn(),
		},
		signUp: {
			email: vi.fn(),
		},
		signOut: vi.fn(),
		getSession: vi.fn(),
	},
}));

vi.mock("./authCoreConfig", () => ({
	getAuthBaseURL: vi.fn(),
	getAppURL: vi.fn(),
}));

vi.mock("./sessionStore", () => ({
	setSession: vi.fn(),
	clearSession: vi.fn(),
	setSessionError: vi.fn(),
	setSessionPending: vi.fn(),
	sessionStore: {
		get: vi.fn(),
	},
}));

import {
	signIn,
	signUp,
	signOut,
	forgotPassword,
	resetPassword,
	refreshSession,
} from "./authActions";
import { authClient } from "./authClient";
import {
	setSession,
	clearSession,
	setSessionError,
	setSessionPending,
} from "./sessionStore";
import { getAuthBaseURL, getAppURL } from "./authCoreConfig";

describe("authActions", () => {
	const mockSession: Session = {
		user: {
			id: "user-1",
			name: "Test User",
			email: "test@example.com",
			image: null,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		session: {
			id: "session-1",
			userId: "user-1",
			token: "token-123",
			expiresAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getAuthBaseURL).mockReturnValue("https://auth.example.com");
		vi.mocked(getAppURL).mockReturnValue("https://app.example.com");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("signIn", () => {
		it("should sign in successfully and fetch session", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: mockSession,
				error: null,
			});

			const result = await signIn({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.data).toEqual(mockSession);
			expect(authClient.signIn.email).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
				rememberMe: false,
			});
			expect(authClient.getSession).toHaveBeenCalled();
			expect(setSession).toHaveBeenCalled();
		});

		it("should handle sign in error", async () => {
			const error = { message: "Invalid credentials" };
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				data: null,
				error,
			});

			const result = await signIn({
				email: "test@example.com",
				password: "wrong",
			});

			expect(result.error).toEqual(error);
			expect(setSessionError).toHaveBeenCalled();
			expect(authClient.getSession).not.toHaveBeenCalled();
		});

		it("should handle getSession error after successful sign in", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			const error = { message: "Session fetch failed" };
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error,
			});

			const result = await signIn({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle getSession returning null data without error", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await signIn({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle rememberMe option", async () => {
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: mockSession,
				error: null,
			});

			await signIn({
				email: "test@example.com",
				password: "password123",
				rememberMe: true,
			});

			expect(authClient.signIn.email).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
				rememberMe: true,
			});
		});
	});

	describe("signUp", () => {
		it("should sign up successfully and fetch session", async () => {
			vi.mocked(authClient.signUp.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: mockSession,
				error: null,
			});

			const result = await signUp({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.data).toEqual(mockSession);
			expect(authClient.signUp.email).toHaveBeenCalledWith({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});
			expect(authClient.getSession).toHaveBeenCalled();
			expect(setSession).toHaveBeenCalled();
		});

		it("should handle sign up error", async () => {
			const error = { message: "Email already exists" };
			vi.mocked(authClient.signUp.email).mockResolvedValue({
				data: null,
				error,
			});

			const result = await signUp({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.error).toEqual(error);
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle getSession error after successful sign up", async () => {
			vi.mocked(authClient.signUp.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			const error = { message: "Session fetch failed" };
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error,
			});

			const result = await signUp({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle getSession returning null data without error after sign up", async () => {
			vi.mocked(authClient.signUp.email).mockResolvedValue({
				data: { user: mockSession.user, token: "token-123" },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await signUp({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});
	});

	describe("signOut", () => {
		it("should sign out successfully", async () => {
			vi.mocked(authClient.signOut).mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await signOut();

			expect(result.data).toBeNull();
			expect(authClient.signOut).toHaveBeenCalled();
			expect(clearSession).toHaveBeenCalled();
		});

		it("should handle sign out error", async () => {
			const error = { message: "Sign out failed" };
			vi.mocked(authClient.signOut).mockResolvedValue({
				data: null,
				error,
			});

			const result = await signOut();

			expect(result.error).toEqual(error);
			expect(setSessionError).toHaveBeenCalled();
		});
	});

	describe("forgotPassword", () => {
		it("should send password recovery email successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: true }),
			});

			const result = await forgotPassword({
				email: "test@example.com",
			});

			expect(result.data).toEqual({ success: true });
			expect(global.fetch).toHaveBeenCalledWith(
				"https://auth.example.com/api/auth/forget-password",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						email: "test@example.com",
						redirectTo: "https://app.example.com/recover/reset",
					}),
				}),
			);
		});

		it("should use custom redirectTo if provided", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: true }),
			});

			await forgotPassword({
				email: "test@example.com",
				redirectTo: "https://custom.com/reset",
			});

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					body: JSON.stringify({
						email: "test@example.com",
						redirectTo: "https://custom.com/reset",
					}),
				}),
			);
		});

		it("should handle password recovery error", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				statusText: "Bad Request",
				json: async () => ({ message: "Email not found" }),
			});

			const result = await forgotPassword({
				email: "test@example.com",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});
	});

	describe("resetPassword", () => {
		it("should reset password successfully", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: true }),
			});

			const result = await resetPassword({
				token: "reset-token-123",
				newPassword: "newpassword123",
			});

			expect(result.data).toEqual({ success: true });
			expect(global.fetch).toHaveBeenCalledWith(
				"https://auth.example.com/api/auth/reset-password",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({
						token: "reset-token-123",
						newPassword: "newpassword123",
					}),
				}),
			);
		});

		it("should handle password reset error", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				statusText: "Bad Request",
				json: async () => ({ message: "Invalid token" }),
			});

			const result = await resetPassword({
				token: "invalid-token",
				newPassword: "newpassword123",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});
	});

	describe("refreshSession", () => {
		it("should refresh session successfully", async () => {
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: mockSession,
				error: null,
			});

			const result = await refreshSession();

			expect(result.data).toEqual(mockSession);
			expect(authClient.getSession).toHaveBeenCalled();
			expect(setSession).toHaveBeenCalled();
		});

		it("should clear session if no session found", async () => {
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: { message: "No session" },
			});

			const result = await refreshSession();

			expect(result.error).toBeDefined();
			expect(clearSession).toHaveBeenCalled();
		});

		it("should clear session if getSession returns null data without error", async () => {
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: null,
			});

			const result = await refreshSession();

			expect(result.error).toBeDefined();
			expect(clearSession).toHaveBeenCalled();
		});

		it("should normalize ipAddress and userAgent from null to undefined", async () => {
			const sessionWithNulls = {
				...mockSession,
				session: {
					...mockSession.session,
					ipAddress: null as any,
					userAgent: null as any,
				},
			};
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: sessionWithNulls,
				error: null,
			});

			const result = await refreshSession();

			expect(result.data?.session.ipAddress).toBeUndefined();
			expect(result.data?.session.userAgent).toBeUndefined();
		});

		it("should preserve ipAddress and userAgent when they are strings", async () => {
			const sessionWithValues = {
				...mockSession,
				session: {
					...mockSession.session,
					ipAddress: "192.168.1.1",
					userAgent: "Mozilla/5.0",
				},
			};
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: sessionWithValues,
				error: null,
			});

			const result = await refreshSession();

			expect(result.data?.session.ipAddress).toBe("192.168.1.1");
			expect(result.data?.session.userAgent).toBe("Mozilla/5.0");
		});

		it("should normalize image from undefined to null", async () => {
			const sessionWithUndefinedImage = {
				...mockSession,
				user: {
					...mockSession.user,
					image: undefined as any,
				},
			};
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: sessionWithUndefinedImage,
				error: null,
			});

			const result = await refreshSession();

			expect(result.data?.user.image).toBeNull();
		});

		it("should handle exceptions during refresh", async () => {
			vi.mocked(authClient.getSession).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await refreshSession();

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});
	});

	describe("error handling", () => {
		it("should handle exceptions during signIn", async () => {
			vi.mocked(authClient.signIn.email).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await signIn({
				email: "test@example.com",
				password: "password123",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle exceptions during signUp", async () => {
			vi.mocked(authClient.signUp.email).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await signUp({
				email: "test@example.com",
				password: "password123",
				name: "Test User",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle exceptions during signOut", async () => {
			vi.mocked(authClient.signOut).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await signOut();

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle fetch errors during forgotPassword", async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

			const result = await forgotPassword({
				email: "test@example.com",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle fetch errors during resetPassword", async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

			const result = await resetPassword({
				token: "token-123",
				newPassword: "newpassword",
			});

			expect(result.error).toBeDefined();
			expect(setSessionError).toHaveBeenCalled();
		});

		it("should handle JSON parse errors in forgotPassword", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				statusText: "Bad Request",
				json: async () => {
					throw new Error("Invalid JSON");
				},
			});

			const result = await forgotPassword({
				email: "test@example.com",
			});

			expect(result.error).toBeDefined();
		});

		it("should handle JSON parse errors in resetPassword", async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				statusText: "Bad Request",
				json: async () => {
					throw new Error("Invalid JSON");
				},
			});

			const result = await resetPassword({
				token: "token-123",
				newPassword: "newpassword",
			});

			expect(result.error).toBeDefined();
		});
	});
});
