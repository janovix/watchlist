"use client";

import { authClient } from "./authClient";
import { clearSession } from "./sessionStore";
import { getAuthAppUrl } from "./authCoreConfig";

/**
 * Logout function
 * Calls Better Auth API, clears local session state, and redirects to auth app
 */
export async function logout(): Promise<void> {
	try {
		await authClient.signOut();
	} catch {
		// Continue even if API call fails
	}

	// Clear local session state
	clearSession();

	// Redirect to auth app
	window.location.href = getAuthAppUrl();
}
