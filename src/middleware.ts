import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const getAuthAppUrl = () => {
	return (
		process.env.AUTH_SERVICE_URL || "https://auth.example.workers.dev"
	);
};

export function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	// No session → redirect to auth app with return URL
	if (!sessionCookie) {
		const authAppUrl = getAuthAppUrl();
		const returnUrl = encodeURIComponent(request.url);
		return NextResponse.redirect(
			`${authAppUrl}/login?redirect_to=${returnUrl}`,
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
