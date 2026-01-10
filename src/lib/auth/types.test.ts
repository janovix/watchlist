import { describe, expect, it } from "vitest";
import type {
	Session,
	SessionState,
	SignInParams,
	SignUpParams,
	ForgotPasswordParams,
	ResetPasswordParams,
} from "./types";

describe("auth types", () => {
	it("should allow null session", () => {
		const session: Session = null;
		expect(session).toBeNull();
	});

	it("should allow valid session structure", () => {
		const session: Session = {
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
				ipAddress: "127.0.0.1",
				userAgent: "test-agent",
			},
		};

		expect(session).toBeDefined();
		expect(session?.user.id).toBe("user-1");
		expect(session?.session.token).toBe("token-123");
	});

	it("should allow SessionState with all fields", () => {
		const state: SessionState = {
			data: null,
			error: null,
			isPending: false,
		};

		expect(state).toBeDefined();
	});

	it("should allow SignInParams", () => {
		const params: SignInParams = {
			email: "test@example.com",
			password: "password123",
			rememberMe: true,
		};

		expect(params.email).toBe("test@example.com");
		expect(params.rememberMe).toBe(true);
	});

	it("should allow SignUpParams", () => {
		const params: SignUpParams = {
			email: "test@example.com",
			password: "password123",
			name: "Test User",
		};

		expect(params.name).toBe("Test User");
	});

	it("should allow ForgotPasswordParams", () => {
		const params: ForgotPasswordParams = {
			email: "test@example.com",
			redirectTo: "https://example.com/reset",
		};

		expect(params.redirectTo).toBe("https://example.com/reset");
	});

	it("should allow ResetPasswordParams", () => {
		const params: ResetPasswordParams = {
			token: "reset-token-123",
			newPassword: "newpassword123",
		};

		expect(params.token).toBe("reset-token-123");
	});
});
