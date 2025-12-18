"use client";

import { clearSession } from "./sessionStore";
import { getAuthAppUrl, getAuthCoreBaseUrl } from "./authCoreConfig";

/**
 * Logout function
 * Calls Better Auth API, clears local session state, and redirects to auth app
 * Uses direct fetch to prevent better-auth from doing automatic redirects
 */
export async function logout(): Promise<void> {
	try {
		// Use direct fetch instead of authClient.signOut() to prevent automatic redirects
		// Better-auth's signOut() may redirect automatically, so we handle redirects ourselves
		const baseUrl = getAuthCoreBaseUrl();
		await fetch(`${baseUrl}/api/auth/sign-out`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			redirect: "manual", // Prevent automatic redirect following
		});
	} catch {
		// Continue even if API call fails
	}

	// Clear local session state
	clearSession();

	// Redirect to auth app (not auth core base URL)
	window.location.href = getAuthAppUrl();
}
