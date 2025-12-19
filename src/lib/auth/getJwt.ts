import { cookies } from "next/headers";
import { getAuthCoreBaseUrl, getAuthAppUrl } from "./config";

/**
 * Get JWT token from auth-svc for server-side API calls
 * Uses cookies from the request to authenticate with auth-svc
 * @returns JWT token or null if not authenticated
 */
export async function getJwt(): Promise<string | null> {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();
	if (
		!cookieHeader.includes("better-auth.session_token") &&
		!cookieHeader.includes("__Secure-better-auth.session_token")
	) {
		return null;
	}
	try {
		const response = await fetch(`${getAuthCoreBaseUrl()}/api/auth/token`, {
			headers: {
				Cookie: cookieHeader,
				Origin: getAuthAppUrl(),
				Accept: "application/json",
			},
			cache: "no-store",
		});
		if (!response.ok) {
			console.error(
				`Failed to get JWT: ${response.status} ${response.statusText}`,
			);
			return null;
		}
		const data = (await response.json()) as { token?: string };
		return data.token ?? null;
	} catch (error) {
		console.error("Error fetching JWT:", error);
		return null;
	}
}
