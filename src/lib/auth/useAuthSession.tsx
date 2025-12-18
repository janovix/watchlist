"use client";

import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";
import { sessionStore, setSession } from "./sessionStore";
import type { Session } from "./types";

/**
 * React hook to access the current auth session
 * Returns the session data, error state, and pending state
 */
export function useAuthSession() {
	const { data, error, isPending } = useStore(sessionStore);
	return { data, error, isPending };
}

/**
 * Props for SessionHydrator component
 */
type SessionHydratorProps = {
	serverSession: Session;
	children: React.ReactNode;
};

/**
 * SessionHydrator component
 * Hydrates the client-side session store with server-fetched session data
 * This prevents UI flicker by ensuring the client store matches the server state
 * on initial render
 */
export function SessionHydrator({
	serverSession,
	children,
}: SessionHydratorProps) {
	const hydrated = useRef(false);

	useEffect(() => {
		// Only hydrate once on mount
		if (!hydrated.current && typeof window !== "undefined") {
			setSession(serverSession);
			hydrated.current = true;
		}
	}, [serverSession]);

	return <>{children}</>;
}
