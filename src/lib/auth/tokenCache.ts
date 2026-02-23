"use client";

import { getClientJwt } from "./authClient";

interface TokenCacheEntry {
	token: string;
	fetchedAt: number;
}

/**
 * Singleton token cache that prevents duplicate /api/auth/token requests.
 *
 * - Time-based: cached tokens are reused for `staleTimeout` ms (default 5 min).
 *   Production JWT TTL is 15 min, so 5 min gives plenty of headroom.
 * - Deduplicated: concurrent callers share a single in-flight promise.
 * - Force-refresh: callers can bypass the cache when they know the token is stale.
 */
class TokenCache {
	private cache: TokenCacheEntry | null = null;
	private fetchPromise: Promise<string | null> | null = null;
	private readonly staleTimeout: number;

	constructor(staleTimeoutMs: number = 5 * 60 * 1000) {
		this.staleTimeout = staleTimeoutMs;
	}

	async getToken(forceRefresh = false): Promise<string | null> {
		if (
			!forceRefresh &&
			this.cache &&
			Date.now() - this.cache.fetchedAt < this.staleTimeout
		) {
			return this.cache.token;
		}

		if (this.fetchPromise) {
			return this.fetchPromise;
		}

		this.fetchPromise = this.fetchAndCache();

		try {
			return await this.fetchPromise;
		} finally {
			this.fetchPromise = null;
		}
	}

	private async fetchAndCache(): Promise<string | null> {
		try {
			const token = await getClientJwt();
			if (token) {
				this.cache = { token, fetchedAt: Date.now() };
			} else {
				this.clear();
			}
			return token;
		} catch (error) {
			this.clear();
			throw error;
		}
	}

	clear(): void {
		this.cache = null;
		this.fetchPromise = null;
	}
}

export const tokenCache = new TokenCache();
