/**
 * Auth module exports
 * Central export point for all auth-related functionality
 */

// Types
export type {
	Session,
	SessionState,
	SignInParams,
	SignUpParams,
	ForgotPasswordParams,
	ResetPasswordParams,
} from "./types";

// Client
export { authClient } from "./authClient";

// Config
export { getAuthBaseURL, getAppURL } from "./authCoreConfig";

// Session Store
export {
	sessionStore,
	setSession,
	clearSession,
	setSessionError,
	setSessionPending,
} from "./sessionStore";

// Auth Actions
export {
	signIn,
	signUp,
	signOut,
	forgotPassword,
	resetPassword,
	refreshSession,
} from "./authActions";

// Server-side
export { getServerSession } from "./getServerSession";

// Client-side hooks and components
export { useAuthSession, SessionHydrator } from "./useAuthSession";
