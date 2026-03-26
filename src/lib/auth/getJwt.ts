import { serverAuthClient } from "./serverAuthClient";

/**
 * Get a JWT token from auth-svc for server-side API calls.
 *
 * Uses the server-side Better Auth client (jwtClient plugin) which
 * automatically forwards cookies and the Origin header via its onRequest
 * hook — no hand-rolled fetch or manual cookie wiring needed.
 *
 * @returns JWT token string, or null if not authenticated.
 */
export async function getJwt(): Promise<string | null> {
	try {
		const result = await serverAuthClient.token();
		if (result.error || !result.data?.token) {
			console.error(
				"[getJwt] Failed to get JWT:",
				result.error ?? "No token in response",
			);
			return null;
		}
		return result.data.token;
	} catch (error) {
		console.error("[getJwt] Error fetching JWT:", error);
		return null;
	}
}
