import { serverAuthClient } from "./serverAuthClient";
import type { Session } from "./types";

export type { Session };

/**
 * Fetches the current session from the auth service on the server side.
 *
 * Uses the server-side Better Auth client which automatically forwards
 * cookies and the required Origin header via its onRequest hook —
 * eliminating the hand-rolled fetch + inline type definitions.
 *
 * @returns The session data if authenticated, or null if not authenticated.
 */
export async function getServerSession(): Promise<Session> {
	try {
		const result = await serverAuthClient.getSession();
		if (!result.data) return null;

		const { user, session } = result.data;
		return {
			user: {
				...user,
				createdAt: new Date(user.createdAt),
				updatedAt: new Date(user.updatedAt),
			},
			session: {
				...session,
				expiresAt: new Date(session.expiresAt),
				createdAt: new Date(session.createdAt),
				updatedAt: new Date(session.updatedAt),
			},
		};
	} catch (error) {
		console.error("[getServerSession] Failed to fetch session:", error);
		return null;
	}
}
