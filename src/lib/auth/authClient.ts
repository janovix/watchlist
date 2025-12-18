import { createAuthClient } from "better-auth/client";
import { getAuthBaseURL } from "./authCoreConfig";

/**
 * Better Auth client instance
 * Configured with credentials: "include" to ensure cookies are sent/received
 */
export const authClient = createAuthClient({
	baseURL: getAuthBaseURL(),
	fetchOptions: {
		credentials: "include", // CRITICAL: Required for cookies
	},
});
