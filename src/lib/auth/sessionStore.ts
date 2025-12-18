import { atom } from "nanostores";
import type { Session, SessionState } from "./types";

/**
 * Client-side reactive session store using nanostores
 * This store holds the current session state and can be subscribed to
 * from any component using the useAuthSession hook
 */
export const sessionStore = atom<SessionState>({
	data: null,
	error: null,
	isPending: true,
});

/**
 * Set the session in the store
 */
export function setSession(session: Session) {
	sessionStore.set({ data: session, error: null, isPending: false });
}

/**
 * Clear the session from the store
 */
export function clearSession() {
	sessionStore.set({ data: null, error: null, isPending: false });
}

/**
 * Set an error in the session store
 */
export function setSessionError(error: Error) {
	const current = sessionStore.get();
	sessionStore.set({ ...current, error, isPending: false });
}

/**
 * Set loading state
 */
export function setSessionPending(isPending: boolean) {
	const current = sessionStore.get();
	sessionStore.set({ ...current, isPending });
}
