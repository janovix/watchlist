"use client";

import { clearSession } from "./sessionStore";
import { getAuthAppUrl, getAuthCoreBaseUrl } from "./config";

export async function logout(): Promise<void> {
	try {
		// Use direct fetch with redirect: "manual" to prevent Better Auth
		// from automatically redirecting to /sign-in before we can redirect
		const baseUrl = getAuthCoreBaseUrl();
		await fetch(`${baseUrl}/api/auth/sign-out`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			redirect: "manual", // CRITICAL: Prevent automatic redirect
		});
	} catch {
		// Continue even if API call fails
	}

	// Clear local session state
	clearSession();

	// Redirect to auth app login
	window.location.href = `${getAuthAppUrl()}/login`;
}
