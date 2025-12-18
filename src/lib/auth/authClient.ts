import { createAuthClient } from "better-auth/client";
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
});
