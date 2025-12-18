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
export {
	getAuthCoreBaseUrl,
	getAuthAppUrl,
	getAuthBaseURL,
	getAppURL,
} from "./authCoreConfig";

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

// Simple logout action (client-side)
export { logout } from "./actions";

// Server-side
export { getServerSession } from "./getServerSession";

// Client-side hooks and components
export { useAuthSession, SessionHydrator } from "./useAuthSession";
