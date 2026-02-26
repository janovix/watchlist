"use client";

import { useState, useEffect, useCallback } from "react";
import { tokenCache } from "@/lib/auth/tokenCache";

interface UseJwtResult {
	jwt: string | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * React hook for client components to asynchronously retrieve and provide the JWT.
 *
 * Uses a shared {@link tokenCache} so multiple components mounting at the same
 * time (or navigating between pages) reuse a single cached token instead of
 * firing parallel /api/auth/token requests. The cache is valid for 5 minutes;
 * calling `refetch()` bypasses it.
 */
export function useJwt(): UseJwtResult {
	const [jwt, setJwt] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchJwt = useCallback(async (forceRefresh = false) => {
		try {
			setIsLoading(true);
			setError(null);
			const token = await tokenCache.getToken(forceRefresh);
			setJwt(token);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch JWT"));
			setJwt(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchJwt();
	}, [fetchJwt]);

	return { jwt, isLoading, error, refetch: () => fetchJwt(true) };
}
