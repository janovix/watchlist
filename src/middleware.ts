import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const getAuthAppUrl = () => {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.example.workers.dev"
	);
};

const getAuthServiceUrl = () => {
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.example.workers.dev"
	);
};

function redirectToLogin(request: NextRequest): NextResponse {
	const authAppUrl = getAuthAppUrl();
	const returnUrl = encodeURIComponent(request.url);
	return NextResponse.redirect(`${authAppUrl}/login?redirect_to=${returnUrl}`);
}

/**
 * Redirect to onboarding if user hasn't completed profile setup or has no organization.
 */
function redirectToOnboarding(request: NextRequest): NextResponse {
	const authAppUrl = getAuthAppUrl();
	const returnUrl = encodeURIComponent(request.url);
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

	// No session cookie → redirect to auth app
	if (!sessionCookie) {
		return redirectToLogin(request);
	}

	// Validate session with auth service
	try {
		const cookieHeader = request.headers.get("cookie") || "";
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

		// Invalid/expired session → redirect to auth app
		if (!response.ok) {
			return redirectToLogin(request);
		}

		const data = (await response.json()) as {
			session?: unknown;
			user?: { name?: string | null };
		};

		// No valid session data → redirect to auth app
		if (!data?.session || !data?.user) {
			return redirectToLogin(request);
		}

		// Check if user needs profile onboarding (no name set)
		if (needsProfileOnboarding(data.user)) {
			return redirectToOnboarding(request);
		}

		// Fetch user organizations to check if they have any membership
		const orgsData = await fetchUserOrganizations(cookieHeader);
		const userOrganizations = orgsData?.organizations ?? null;

		// Check if user has any organization membership
		if (!hasOrganizationMembership(userOrganizations)) {
			return redirectToOnboarding(request);
		}
	} catch {
		// Auth service error → redirect to auth app
		return redirectToLogin(request);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
