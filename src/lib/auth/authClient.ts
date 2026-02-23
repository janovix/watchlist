import { createAuthClient } from "better-auth/client";
import { jwtClient, organizationClient } from "better-auth/client/plugins";
import { getAuthCoreBaseUrl } from "./config";

export interface RateLimitEventDetail {
	retryAfter: number;
	url?: string;
}

export const AUTH_RATE_LIMIT_EVENT = "auth:rate-limited";

/**
 * Better Auth client instance
 * Configured with credentials: "include" to ensure cookies are sent/received
 */
export const authClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
		onError: async (context) => {
			const { response } = context;

			if (response.status === 429) {
				const retryAfterHeader = response.headers.get("X-Retry-After");
				if (!retryAfterHeader) return;

				const retryAfter = parseInt(retryAfterHeader, 10);
				if (isNaN(retryAfter) || retryAfter <= 0) return;

				if (typeof window !== "undefined") {
					const detail: RateLimitEventDetail = {
						retryAfter,
						url: response.url,
					};
					window.dispatchEvent(
						new CustomEvent(AUTH_RATE_LIMIT_EVENT, { detail }),
					);
				}
			}
		},
	},
	plugins: [jwtClient(), organizationClient()],
});

/**
 * Get JWT token for client-side API calls
 * @returns JWT token or null if not authenticated
 */
export async function getClientJwt(): Promise<string | null> {
	try {
		const result = await authClient.token();
		if (result.error || !result.data?.token) {
			console.error(
				"Failed to get JWT:",
				result.error ?? "No token in response",
			);
			return null;
		}
		return result.data.token;
	} catch (error) {
		console.error("Error fetching JWT:", error);
		return null;
	}
}
