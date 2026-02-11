import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const getAuthAppUrl = () => {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.janovix.workers.dev"
	);
};

const getAuthServiceUrl = () => {
	// For middleware (Edge Runtime), prefer internal URL that doesn't need DNS resolution
	// This allows local development where hosts file entries aren't available in Edge Runtime
	const internalUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL_INTERNAL;
	if (internalUrl) {
		return internalUrl;
	}
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.janovix.workers.dev"
	);
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
}

interface OrgsResponse {
	organizations?: Organization[];
	activeOrganizationId?: string | null;
}

/**
 * Fetch user's organizations from auth service
 */
async function fetchUserOrganizations(
	cookieHeader: string,
): Promise<OrgsResponse | null> {
	try {
		const response = await fetch(
			`${getAuthServiceUrl()}/api/auth/organization/list`,
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

		const data = await response.json();

		// Handle both array and object response formats
		if (Array.isArray(data)) {
			return { organizations: data, activeOrganizationId: null };
		}

		return data as OrgsResponse;
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

		// Invalid/expired session → redirect to auth app
		if (!response.ok) {
			console.log(
				"[Watchlist Middleware] Response not OK, redirecting to login",
			);
			return redirectToLogin(request);
		}

		const data = (await response.json()) as {
			session?: unknown;
			user?: { name?: string | null };
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
			return redirectToLogin(request);
		}

		// Check if user needs profile onboarding (no name set)
		if (needsProfileOnboarding(data.user)) {
			console.log(
				"[Watchlist Middleware] User needs profile onboarding, redirecting",
			);
			return redirectToOnboarding(request);
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
			return redirectToOnboarding(request);
		}

		console.log("[Watchlist Middleware] Session valid, allowing request");
	} catch (error) {
		// Auth service error → redirect to auth app
		console.log("[Watchlist Middleware] Error during validation:", error);
		return redirectToLogin(request);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|monitoring|_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
