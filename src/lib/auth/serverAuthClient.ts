/**
 * Server-side Better Auth client.
 *
 * Intentionally NOT marked "use client" — safe to import from Server
 * Components, Server Actions, and API route handlers.
 *
 * On every outgoing request it automatically:
 *  - Forwards the caller's cookies (from next/headers) so Better Auth
 *    can identify the session without any extra wiring at the call site.
 *  - Sets the Origin header to the auth-svc URL, which Better Auth
 *    requires to pass its origin check for server-to-server requests.
 *
 * For client-side usage keep using authClient from ./authClient instead.
 */
import { createAuthClient } from "better-auth/client";
import { jwtClient, organizationClient } from "better-auth/client/plugins";
import { cookies } from "next/headers";

import { getAuthCoreBaseUrl, getAuthAppUrl } from "./config";

export const serverAuthClient = createAuthClient({
	baseURL: getAuthCoreBaseUrl(),
	fetchOptions: {
		credentials: "include",
		onRequest: async (ctx) => {
			const cookieStore = await cookies();
			const cookieHeader = cookieStore.toString();
			if (cookieHeader) {
				ctx.headers.set("cookie", cookieHeader);
			}
			// Better Auth validates Origin on server-to-server requests.
			ctx.headers.set("origin", getAuthAppUrl());
		},
	},
	plugins: [jwtClient(), organizationClient()],
});

export type ServerAuthClient = typeof serverAuthClient;
