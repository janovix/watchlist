import { fetchJson, ApiError } from "./http";

/**
 * Identifier object structure from OFAC/watchlist
 */
export interface Identifier {
	type?: string;
	number?: string;
}

/**
 * Watchlist target from the API (reused from pep.ts)
 */
export interface WatchlistTarget {
	id: string;
	schema: string | null;
	name: string | null;
	aliases: string[] | null;
	birthDate: string | null;
	countries: string[] | null;
	addresses: string[] | null;
	identifiers: Identifier[] | null;
	sanctions: string[] | null;
	phones: string[] | null;
	emails: string[] | null;
	programIds: string[] | null;
	dataset: string | null;
	firstSeen: string | null;
	lastSeen: string | null;
	lastChange: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Watchlist search request parameters
 */
export interface WatchlistSearchRequest {
	q: string; // Required: name/query text
	dataset?: string; // Optional: filter by dataset (e.g., "ofac_sdn")
	countries?: string[]; // Optional: country filter
	birthDate?: string; // Optional: for meta scoring
	identifiers?: string[]; // Optional: exact identifier lookup
	topK?: number; // Default: 20
	threshold?: number; // Default: 0.80
}

/**
 * Score breakdown for transparency
 */
export interface ScoreBreakdown {
	vectorScore: number; // Cosine similarity from Vectorize (0-1)
	nameScore: number; // Jaro-Winkler name similarity (0-1)
	metaScore: number; // Metadata match score (0-1)
	identifierMatch: boolean; // True if matched via exact identifier lookup
}

/**
 * Single match result with target and scoring
 */
export interface WatchlistMatch {
	target: WatchlistTarget;
	score: number; // Final hybrid score (0-1)
	breakdown: ScoreBreakdown;
}

/**
 * PEP search information from the API
 */
export interface PepSearchInfo {
	searchId: string;
	status: "completed" | "pending";
	results: unknown | null; // Can be PepRawResult[] when cached
}

/**
 * API response from POST /search
 */
export interface WatchlistSearchApiResponse {
	success: boolean;
	result: {
		matches: WatchlistMatch[];
		count: number;
		pepSearch?: PepSearchInfo; // Optional PEP search information
	};
}

/**
 * Base URL for the watchlist service API.
 * Can be overridden with WATCHLIST_API_BASE_URL environment variable.
 */
function getWatchlistApiBaseUrl(): string {
	return (
		process.env.WATCHLIST_API_BASE_URL ??
		process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ??
		"https://watchlist-svc.janovix.workers.dev"
	);
}

/**
 * Options for watchlist search
 */
export interface SearchWatchlistOptions {
	/**
	 * JWT token to include in Authorization header.
	 * When provided, adds `Authorization: Bearer <jwt>` header.
	 */
	jwt?: string;
}

/**
 * Search watchlist using hybrid search algorithm.
 * Combines exact identifier matching, semantic vector search, and Jaro-Winkler name similarity.
 *
 * @param params - Search parameters
 * @param options - Optional configuration including JWT token
 * @returns Promise resolving to the search results with hybrid scoring
 * @throws ApiError if the request fails
 */
export async function searchWatchlist(
	params: WatchlistSearchRequest,
	options?: SearchWatchlistOptions,
): Promise<WatchlistSearchApiResponse> {
	const baseUrl = getWatchlistApiBaseUrl();
	const url = `${baseUrl}/search`;

	try {
		const { json } = await fetchJson<WatchlistSearchApiResponse>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(params),
			jwt: options?.jwt,
		});

		// Check if API response indicates success
		if (!json.success) {
			throw new ApiError("API returned unsuccessful response", {
				status: 500,
				body: json,
			});
		}

		return json;
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(
			`Failed to search watchlist: ${error instanceof Error ? error.message : "Unknown error"}`,
			{ status: 500, body: null },
		);
	}
}
