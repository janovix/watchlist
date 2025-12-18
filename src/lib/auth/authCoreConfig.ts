/**
 * Config Helper with Fallbacks
 * Provides URL helpers with fallback values for Better Auth integration
 */

/**
 * Get the Better Auth core base URL
 * Falls back to default if env var is not set
 */
export function getAuthCoreBaseUrl(): string {
	return (
		process.env.NEXT_PUBLIC_AUTH_CORE_BASE_URL ||
		"https://auth-svc.example.workers.dev"
	);
}

/**
 * Get the auth app URL for redirects
 * Falls back to default if env var is not set
 */
export function getAuthAppUrl(): string {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.example.workers.dev"
	);
}

/**
 * Legacy aliases for backward compatibility
 * @deprecated Use getAuthCoreBaseUrl() instead
 */
export function getAuthBaseURL(): string {
	return getAuthCoreBaseUrl();
}

/**
 * Legacy alias for backward compatibility
 * @deprecated Use getAuthAppUrl() instead
 */
export function getAppURL(): string {
	return getAuthAppUrl();
}
