/**
 * Get the Better Auth base URL from environment variables
 */
export function getAuthBaseURL(): string {
	const baseURL = process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL;
	if (!baseURL) {
		throw new Error(
			"NEXT_PUBLIC_AUTH_CORE_BASE_URL environment variable is not set",
		);
	}
	return baseURL;
}

/**
 * Get the app URL for redirects
 */
export function getAppURL(): string {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL ||
		(typeof window !== "undefined" ? window.location.origin : "")
	);
}
