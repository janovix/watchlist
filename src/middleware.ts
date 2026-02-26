import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Helper to add Set-Cookie headers from auth-svc to a Next.js response.
 * This is CRITICAL for cookie cache refresh - without forwarding these headers,
 * the browser never receives refreshed session cookies and sessions expire prematurely.
 */
function addAuthCookies(
	response: NextResponse,
	cookies: string[],
): NextResponse {
	if (!cookies || cookies.length === 0) {
		return response;
	}

	// Add the auth-svc Set-Cookie headers to the response
	for (const cookie of cookies) {
		response.headers.append("Set-Cookie", cookie);
	}

	return response;
}

const getAuthAppUrl = () => {
	const url = process.env.NEXT_PUBLIC_AUTH_APP_URL;
	if (!url || url.trim().length === 0) {
		throw new Error(
			"Missing required environment variable: NEXT_PUBLIC_AUTH_APP_URL. " +
				"Check your .env.local file or Cloudflare build environment variables.",
		);
	}
	return url.trim().replace(/\/$/, "");
};

const getAuthServiceUrl = () => {
	const url = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
	if (!url || url.trim().length === 0) {
		throw new Error(
			"Missing required environment variable: NEXT_PUBLIC_AUTH_SERVICE_URL. " +
				"Check your .env.local file or Cloudflare build environment variables.",
		);
	}
	return url.trim().replace(/\/$/, "");
};

/**
 * Get the external base URL for the request, using forwarded headers from reverse proxy.
 * Returns the origin (protocol + host) without path.
 */
function getExternalOrigin(request: NextRequest): string {
	// Check for forwarded headers (set by Caddy or other reverse proxies)
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto");

	if (forwardedHost) {
		const protocol = forwardedProto || "https";
		return `${protocol}://${forwardedHost}`;
	}

	// Fallback to request.url origin (works when not behind a proxy)
	return new URL(request.url).origin;
}

/**
 * Get the full external URL for the request, using forwarded headers from reverse proxy.
 * Falls back to request.url if no forwarded headers are present.
 */
function getExternalUrl(request: NextRequest): string {
	const origin = getExternalOrigin(request);
	const pathname = request.nextUrl.pathname;
	const search = request.nextUrl.search;
	return `${origin}${pathname}${search}`;
}

function redirectToLogin(request: NextRequest): NextResponse {
	const authAppUrl = getAuthAppUrl();
	const returnUrl = encodeURIComponent(getExternalUrl(request));
	return NextResponse.redirect(`${authAppUrl}/login?redirect_to=${returnUrl}`);
}

/**
 * Redirect to onboarding if user hasn't completed profile setup or has no organization.
 */
function redirectToOnboarding(request: NextRequest): NextResponse {
	const authAppUrl = getAuthAppUrl();
	const returnUrl = encodeURIComponent(getExternalUrl(request));
	return NextResponse.redirect(
		`${authAppUrl}/onboarding?redirect_to=${returnUrl}`,
	);
}

/**
 * Check if user needs profile onboarding (no name or empty name).
 */
function needsProfileOnboarding(user: { name?: string | null }): boolean {
	const userName = user?.name?.trim();
	return !userName;
}

interface Organization {
	id: string;
	slug: string;
	name: string;
	role?: string;
}

interface OrgsResponse {
	organizations?: Organization[];
	activeOrganizationId?: string | null;
}

/**
 * Fetch user's organizations from auth service, each enriched with the
 * current user's membership role in a single query (no N+1 list-members).
 */
async function fetchUserOrganizations(
	cookieHeader: string,
): Promise<OrgsResponse | null> {
	try {
		const response = await fetch(
			`${getAuthServiceUrl()}/api/organization/list-with-role`,
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
			success: boolean;
			data: Organization[];
		} | null;

		return {
			organizations: data?.data ?? [],
			activeOrganizationId: null,
		};
	} catch {
		return null;
	}
}

/**
 * Check if user has any organization membership.
 */
function hasOrganizationMembership(
	organizations: Organization[] | null,
): boolean {
	return organizations !== null && organizations.length > 0;
}

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	// DEBUG: Log configuration in development
	console.log("[Watchlist Middleware] Auth Service URL:", getAuthServiceUrl());
	console.log("[Watchlist Middleware] Auth App URL:", getAuthAppUrl());
	console.log(
		"[Watchlist Middleware] Session cookie:",
		sessionCookie ? "EXISTS" : "NULL",
	);

	// No session cookie → redirect to auth app
	if (!sessionCookie) {
		console.log(
			"[Watchlist Middleware] No session cookie, redirecting to login",
		);
		return redirectToLogin(request);
	}

	// Validate session with auth service
	let authServiceSetCookies: string[] = [];

	try {
		const cookieHeader = request.headers.get("cookie") || "";
		console.log("[Watchlist Middleware] Validating session with auth-svc...");
		const response = await fetch(
			`${getAuthServiceUrl()}/api/auth/get-session`,
			{
				headers: {
					Cookie: cookieHeader,
					Origin: getAuthAppUrl(),
				},
				cache: "no-store",
			},
		);

		console.log(
			"[Watchlist Middleware] Auth-svc response status:",
			response.status,
		);

		// CRITICAL: Capture Set-Cookie headers from auth-svc
		// These headers contain refreshed session cookies that MUST be forwarded to the browser
		// Without this, the cookie cache never refreshes and sessions expire prematurely
		const setCookies = response.headers.getSetCookie?.();
		if (setCookies && setCookies.length > 0) {
			authServiceSetCookies = setCookies;
			console.log(
				`[Watchlist Middleware] Captured ${setCookies.length} Set-Cookie headers from auth-svc`,
			);
		}

		// Invalid/expired session → redirect to auth app
		if (!response.ok) {
			console.log(
				"[Watchlist Middleware] Response not OK, redirecting to login",
			);
			const redirectResponse = redirectToLogin(request);
			return addAuthCookies(redirectResponse, authServiceSetCookies);
		}

		const data = (await response.json()) as {
			session?: unknown;
			user?: { name?: string | null; banned?: boolean };
		};

		console.log(
			"[Watchlist Middleware] Session data:",
			JSON.stringify(data, null, 2),
		);

		// No valid session data → redirect to auth app
		if (!data?.session || !data?.user) {
			console.log(
				"[Watchlist Middleware] No session/user in response, redirecting to login",
			);
			const redirectResponse = redirectToLogin(request);
			return addAuthCookies(redirectResponse, authServiceSetCookies);
		}

		// Check if user is banned
		if (data.user?.banned) {
			console.log(
				"[Watchlist Middleware] User is banned, redirecting to login",
			);
			const redirectResponse = redirectToLogin(request);
			return addAuthCookies(redirectResponse, authServiceSetCookies);
		}

		// Check if user needs profile onboarding (no name set)
		if (needsProfileOnboarding(data.user)) {
			console.log(
				"[Watchlist Middleware] User needs profile onboarding, redirecting",
			);
			const onboardingResponse = redirectToOnboarding(request);
			return addAuthCookies(onboardingResponse, authServiceSetCookies);
		}

		// Fetch user organizations to check if they have any membership
		const orgsData = await fetchUserOrganizations(cookieHeader);
		const userOrganizations = orgsData?.organizations ?? null;

		console.log(
			"[Watchlist Middleware] User organizations:",
			userOrganizations?.length ?? 0,
		);

		// Check if user has any organization membership
		if (!hasOrganizationMembership(userOrganizations)) {
			console.log(
				"[Watchlist Middleware] User has no organization, redirecting to onboarding",
			);
			const onboardingResponse = redirectToOnboarding(request);
			return addAuthCookies(onboardingResponse, authServiceSetCookies);
		}

		console.log("[Watchlist Middleware] Session valid, allowing request");
	} catch (error) {
		// Auth service error → redirect to auth app
		console.log("[Watchlist Middleware] Error during validation:", error);
		const redirectResponse = redirectToLogin(request);
		return addAuthCookies(redirectResponse, authServiceSetCookies);
	}

	const nextResponse = NextResponse.next();
	return addAuthCookies(nextResponse, authServiceSetCookies);
}

export const config = {
	matcher: [
		"/((?!api|monitoring|_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
