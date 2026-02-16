export const getAuthCoreBaseUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.example.workers.dev"
	);
};

/**
 * Get the auth service URL for server-side requests.
 * During local development, uses the internal URL (localhost).
 * For production, uses the public URL.
 */
export const getAuthCoreServerUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL_INTERNAL ||
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.example.workers.dev"
	);
};

export const getAuthAppUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.example.workers.dev"
	);
};
