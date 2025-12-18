import { cookies } from "next/headers";
import { getAuthCoreBaseUrl, getAuthAppUrl } from "./authCoreConfig";
import type { Session } from "./types";

/**
 * Get the current session on the server side
 * This function forwards cookies from the request to the Better Auth service
 * to fetch the session for Server Components
 */
export async function getServerSession(): Promise<Session> {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	// Check for session cookie existence
	if (!cookieHeader.includes("better-auth.session_token")) {
		return null;
	}

	try {
		const response = await fetch(
			`${getAuthCoreBaseUrl()}/api/auth/get-session`,
			{
				headers: {
					Cookie: cookieHeader,
					Origin: getAuthAppUrl(),
				},
				cache: "no-store",
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as {
			session?: {
				id: string;
				userId: string;
				token: string;
				expiresAt: Date | string;
				createdAt: Date | string;
				updatedAt: Date | string;
				ipAddress?: string;
				userAgent?: string;
			};
			user?: {
				id: string;
				name: string;
				email: string;
				image?: string | null;
				emailVerified: boolean;
				createdAt: Date | string;
				updatedAt: Date | string;
			};
		};

		// Ensure we have both user and session data
		if (data.session && data.user) {
			// Convert ISO date strings to Date objects if needed
			const session: Session = {
				user: {
					...data.user,
					image: data.user.image ?? null, // Normalize undefined to null
					createdAt:
						data.user.createdAt instanceof Date
							? data.user.createdAt
							: new Date(data.user.createdAt),
					updatedAt:
						data.user.updatedAt instanceof Date
							? data.user.updatedAt
							: new Date(data.user.updatedAt),
				},
				session: {
					...data.session,
					expiresAt:
						data.session.expiresAt instanceof Date
							? data.session.expiresAt
							: new Date(data.session.expiresAt),
					createdAt:
						data.session.createdAt instanceof Date
							? data.session.createdAt
							: new Date(data.session.createdAt),
					updatedAt:
						data.session.updatedAt instanceof Date
							? data.session.updatedAt
							: new Date(data.session.updatedAt),
				},
			};
			return session;
		}

		return null;
	} catch (error) {
		console.error("Failed to fetch server session:", error);
		return null;
	}
}
