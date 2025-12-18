"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthSession } from "@/lib/auth";
import { getAuthBaseURL } from "@/lib/auth/authCoreConfig";

interface SessionGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

/**
 * SessionGuard component
 * Redirects to auth URL if session is required but not present
 * Adds redirect_to query param to return user to current URL after auth
 */
export function SessionGuard({
	children,
	requireAuth = true,
}: SessionGuardProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { data: session, isPending } = useAuthSession();

	useEffect(() => {
		if (isPending) return; // Wait for session to load

		if (requireAuth && !session) {
			// Build auth URL with redirect_to param
			if (typeof window !== "undefined") {
				try {
					const authBaseURL = getAuthBaseURL();
					const currentUrl = encodeURIComponent(window.location.href);
					// Better Auth typically uses /sign-in endpoint
					const authUrl = `${authBaseURL}/sign-in?redirect_to=${currentUrl}`;

					// Redirect to auth service
					window.location.href = authUrl;
				} catch (error) {
					console.error("Failed to get auth base URL:", error);
				}
			}
		}
	}, [session, isPending, requireAuth, pathname, router]);

	// Show loading state while checking session
	if (isPending) {
		return null; // Or return a loading spinner if preferred
	}

	// If auth is required and no session, don't render children (redirect will happen)
	if (requireAuth && !session) {
		return null;
	}

	return <>{children}</>;
}
