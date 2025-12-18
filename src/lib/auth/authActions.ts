import { authClient } from "./authClient";
import { getAuthBaseURL, getAppURL } from "./authCoreConfig";
import {
	setSession,
	clearSession,
	setSessionError,
	setSessionPending,
} from "./sessionStore";
import type {
	Session,
	SignInParams,
	SignUpParams,
	ForgotPasswordParams,
	ResetPasswordParams,
} from "./types";

/**
 * Sign in with email and password
 * IMPORTANT: Better Auth's signIn.email() returns { user, token } but NOT the full session.
 * We must make a follow-up getSession() call to get the complete session structure.
 */
export async function signIn(params: SignInParams) {
	try {
		setSessionPending(true);

		// Step 1: Sign in
		const result = await authClient.signIn.email({
			email: params.email,
			password: params.password,
			rememberMe: params.rememberMe ?? false,
		});

		if (result.error) {
			setSessionError(new Error(result.error.message || "Sign in failed"));
			return { error: result.error };
		}

		// Step 2: Fetch full session (REQUIRED for complete session data)
		const sessionResult = await authClient.getSession();
		if (sessionResult.error || !sessionResult.data) {
			setSessionError(
				new Error(sessionResult.error?.message || "Failed to fetch session"),
			);
			return {
				error: sessionResult.error || new Error("Failed to fetch session"),
			};
		}

		// Set the full session in the store
		// Normalize fields: Better Auth may return undefined/null, but our type expects specific types
		const normalizedSession: Session = sessionResult.data
			? {
					...sessionResult.data,
					user: {
						...sessionResult.data.user,
						image: sessionResult.data.user.image ?? null,
					},
					session: {
						...sessionResult.data.session,
						ipAddress:
							sessionResult.data.session.ipAddress === null
								? undefined
								: sessionResult.data.session.ipAddress,
						userAgent:
							sessionResult.data.session.userAgent === null
								? undefined
								: sessionResult.data.session.userAgent,
					},
				}
			: null;
		setSession(normalizedSession);
		return { data: normalizedSession };
	} catch (error) {
		const err = error instanceof Error ? error : new Error("Sign in failed");
		setSessionError(err);
		return { error: err };
	} finally {
		setSessionPending(false);
	}
}

/**
 * Sign up with email, password, and name
 * IMPORTANT: Better Auth's signUp.email() returns { user, token } but NOT the full session.
 * We must make a follow-up getSession() call to get the complete session structure.
 */
export async function signUp(params: SignUpParams) {
	try {
		setSessionPending(true);

		// Step 1: Sign up
		const result = await authClient.signUp.email({
			email: params.email,
			password: params.password,
			name: params.name,
		});

		if (result.error) {
			setSessionError(new Error(result.error.message || "Sign up failed"));
			return { error: result.error };
		}

		// Step 2: Fetch full session (REQUIRED for complete session data)
		const sessionResult = await authClient.getSession();
		if (sessionResult.error || !sessionResult.data) {
			setSessionError(
				new Error(sessionResult.error?.message || "Failed to fetch session"),
			);
			return {
				error: sessionResult.error || new Error("Failed to fetch session"),
			};
		}

		// Set the full session in the store
		// Normalize fields: Better Auth may return undefined/null, but our type expects specific types
		const normalizedSession: Session = sessionResult.data
			? {
					...sessionResult.data,
					user: {
						...sessionResult.data.user,
						image: sessionResult.data.user.image ?? null,
					},
					session: {
						...sessionResult.data.session,
						ipAddress:
							sessionResult.data.session.ipAddress === null
								? undefined
								: sessionResult.data.session.ipAddress,
						userAgent:
							sessionResult.data.session.userAgent === null
								? undefined
								: sessionResult.data.session.userAgent,
					},
				}
			: null;
		setSession(normalizedSession);
		return { data: normalizedSession };
	} catch (error) {
		const err = error instanceof Error ? error : new Error("Sign up failed");
		setSessionError(err);
		return { error: err };
	} finally {
		setSessionPending(false);
	}
}

/**
 * Sign out the current user
 */
export async function signOut() {
	try {
		setSessionPending(true);

		const result = await authClient.signOut();
		if (result.error) {
			setSessionError(new Error(result.error.message || "Sign out failed"));
			return { error: result.error };
		}

		// Clear the session from the store
		clearSession();
		return { data: null };
	} catch (error) {
		const err = error instanceof Error ? error : new Error("Sign out failed");
		setSessionError(err);
		return { error: err };
	} finally {
		setSessionPending(false);
	}
}

/**
 * Request password recovery email
 * NOTE: Better Auth client doesn't expose forgetPassword, so we use direct fetch
 */
export async function forgotPassword(params: ForgotPasswordParams) {
	try {
		setSessionPending(true);

		const baseUrl = getAuthBaseURL();
		const redirectTo = params.redirectTo || `${getAppURL()}/recover/reset`;

		const response = await fetch(`${baseUrl}/api/auth/forget-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				email: params.email,
				redirectTo,
			}),
		});

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as {
				message?: string;
			};
			const error = new Error(
				errorData.message || `Password recovery failed: ${response.statusText}`,
			);
			setSessionError(error);
			return { error };
		}

		return { data: { success: true } };
	} catch (error) {
		const err =
			error instanceof Error ? error : new Error("Password recovery failed");
		setSessionError(err);
		return { error: err };
	} finally {
		setSessionPending(false);
	}
}

/**
 * Reset password with token
 * NOTE: Better Auth client doesn't expose resetPassword, so we use direct fetch
 */
export async function resetPassword(params: ResetPasswordParams) {
	try {
		setSessionPending(true);

		const baseUrl = getAuthBaseURL();

		const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				token: params.token,
				newPassword: params.newPassword,
			}),
		});

		if (!response.ok) {
			const errorData = (await response.json().catch(() => ({}))) as {
				message?: string;
			};
			const error = new Error(
				errorData.message || `Password reset failed: ${response.statusText}`,
			);
			setSessionError(error);
			return { error };
		}

		return { data: { success: true } };
	} catch (error) {
		const err =
			error instanceof Error ? error : new Error("Password reset failed");
		setSessionError(err);
		return { error: err };
	} finally {
		setSessionPending(false);
	}
}

/**
 * Refresh the current session
 * Useful for checking if session is still valid
 */
export async function refreshSession() {
	try {
		setSessionPending(true);

		const sessionResult = await authClient.getSession();
		if (sessionResult.error || !sessionResult.data) {
			clearSession();
			return { error: sessionResult.error || new Error("No session found") };
		}

		// Normalize fields: Better Auth may return undefined/null, but our type expects specific types
		const normalizedSession: Session = sessionResult.data
			? {
					...sessionResult.data,
					user: {
						...sessionResult.data.user,
						image: sessionResult.data.user.image ?? null,
					},
					session: {
						...sessionResult.data.session,
						ipAddress:
							sessionResult.data.session.ipAddress === null
								? undefined
								: sessionResult.data.session.ipAddress,
						userAgent:
							sessionResult.data.session.userAgent === null
								? undefined
								: sessionResult.data.session.userAgent,
					},
				}
			: null;
		setSession(normalizedSession);
		return { data: normalizedSession };
	} catch (error) {
		const err =
			error instanceof Error ? error : new Error("Failed to refresh session");
		setSessionError(err);
		return { error: err };
	} finally {
		setSessionPending(false);
	}
}
