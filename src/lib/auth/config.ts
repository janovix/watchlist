import { requireEnv } from "@/lib/env";

export const getAuthCoreBaseUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_AUTH_SERVICE_URL",
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
	);
};

/**
 * Get the auth service URL for server-side requests.
 * During local development, uses the internal URL (localhost).
 * For production, uses the public URL.
 */
export const getAuthCoreServerUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_AUTH_SERVICE_URL",
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
	);
};

export const getAuthAppUrl = (): string => {
	return requireEnv(
		"NEXT_PUBLIC_AUTH_APP_URL",
		process.env.NEXT_PUBLIC_AUTH_APP_URL,
	);
};
