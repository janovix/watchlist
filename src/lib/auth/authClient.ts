import { createAuthClient } from "better-auth/client";
import { jwtClient } from "better-auth/client/plugins";
import { getAuthCoreBaseUrl } from "./config";

/**
 * Better Auth client instance
 * Configured with credentials: "include" to ensure cookies are sent/received
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include", // CRITICAL: Required for cookies
	},
	plugins: [jwtClient()],
});

/**
 * Get JWT token for client-side API calls
 * @returns JWT token or null if not authenticated
 */
export async function getClientJwt(): Promise<string | null> {
	try {
		const result = await authClient.token();
		if (result.error || !result.data?.token) {
			console.error("Failed to get JWT:", result.error);
			return null;
		}
		return result.data.token;
	} catch (error) {
		console.error("Error fetching JWT:", error);
		return null;
	}
}
