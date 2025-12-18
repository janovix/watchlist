/**
 * Better Auth Session Type
 * Matches the exact structure returned by Better Auth
 */
export type Session = {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
	};
	session: {
		id: string;
		userId: string;
		token: string;
		expiresAt: Date;
		createdAt: Date;
		updatedAt: Date;
		ipAddress?: string;
		userAgent?: string;
	};
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
