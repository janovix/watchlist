import type { serverAuthClient } from "./serverAuthClient";

type InferredSession = NonNullable<typeof serverAuthClient.$Infer.Session>;

export type SessionUser = InferredSession["user"];
export type SessionData = InferredSession["session"];

export type Session = {
	user: SessionUser;
	session: SessionData;
} | null;

/**
 * Session state for client-side store
 */
export type SessionState = {
	data: Session;
	error: Error | null;
	isPending: boolean;
};

/**
 * Sign-in parameters
 */
export type SignInParams = {
	email: string;
	password: string;
	rememberMe?: boolean;
};

/**
 * Sign-up parameters
 */
export type SignUpParams = {
	email: string;
	password: string;
	name: string;
};

/**
 * Password recovery parameters
 */
export type ForgotPasswordParams = {
	email: string;
	redirectTo?: string;
};

/**
 * Password reset parameters
 */
export type ResetPasswordParams = {
	token: string;
	newPassword: string;
};
