import { fetchJson, ApiError } from "./http";

/**
 * Identifier object structure
 */
export interface Identifier {
	type?: string;
	number?: string;
	country?: string;
	issueDate?: string;
	expirationDate?: string;
}

/**
 * SAT 69-B Phase structure
 */
export interface Sat69bPhase {
	satNotice: string | null;
	satDate: string | null;
	dofNotice: string | null;
	dofDate: string | null;
}

/**
 * OFAC Target - Specially Designated Nationals
 */
export interface OfacTarget {
	id: string;
	partyType: string;
	primaryName: string;
	aliases: string[] | null;
	birthDate: string | null;
	birthPlace: string | null;
	addresses: string[] | null;
	identifiers: Identifier[] | null;
	remarks: string | null;
	sourceList: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * UNSC Target - UN Security Council sanctions
 */
export interface UnscTarget {
	id: string;
	partyType: string;
	primaryName: string;
	aliases: string[] | null;
	birthDate: string | null;
	birthPlace: string | null;
	gender: string | null;
	nationalities: string[] | null;
	addresses: string[] | null;
	identifiers: Identifier[] | null;
	designations: string[] | null;
	remarks: string | null;
	unListType: string;
	referenceNumber: string | null;
	listedOn: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * SAT 69-B Target - Mexican tax authority list
 */
export interface Sat69bTarget {
	id: string;
	rfc: string;
	taxpayerName: string;
	taxpayerStatus: string;
	presumptionPhase: Sat69bPhase | null;
	rebuttalPhase: Sat69bPhase | null;
	definitivePhase: Sat69bPhase | null;
	favorablePhase: Sat69bPhase | null;
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
 * Watchlist match with score breakdown
 */
export interface OfacMatch {
	target: OfacTarget;
	score: number;
	breakdown: ScoreBreakdown;
}

export interface UnscMatch {
	target: UnscTarget;
	score: number;
	breakdown: ScoreBreakdown;
}

export interface Sat69bMatch {
	target: Sat69bTarget;
	score: number;
	breakdown: ScoreBreakdown;
}

// Legacy type for backward compatibility (deprecated)
export type WatchlistMatch = OfacMatch | UnscMatch | Sat69bMatch;

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
		ofac: {
			matches: OfacMatch[];
			count: number;
		};
		unsc: {
			matches: UnscMatch[];
			count: number;
		};
		sat69b: {
			matches: Sat69bMatch[];
			count: number;
		};
		pepSearch?: PepSearchInfo;
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
 * Usage limit error response from backend
 */
export interface UsageLimitError {
	success: false;
	error: string;
	code: "USAGE_LIMIT_EXCEEDED";
	upgradeRequired: boolean;
	metric: string;
	used: number;
	limit: number;
	entitlementType: "license" | "stripe" | "none";
	message: string;
}

/**
 * Type guard to check if error body is a usage limit error
 */
export function isUsageLimitError(body: unknown): body is UsageLimitError {
	return (
		typeof body === "object" &&
		body !== null &&
		"code" in body &&
		body.code === "USAGE_LIMIT_EXCEEDED"
	);
}

/**
 * Search watchlist using hybrid search algorithm.
 * Combines exact identifier matching, semantic vector search, and Jaro-Winkler name similarity.
 *
 * @param params - Search parameters
 * @param options - Optional configuration including JWT token
 * @returns Promise resolving to the search results with hybrid scoring
 * @throws ApiError if the request fails (including 403 for usage limits)
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
			// Preserve 403 errors with usage limit information
			if (error.status === 403 && isUsageLimitError(error.body)) {
				// Re-throw with usage limit details preserved in the body
				throw new ApiError(
					error.body.message ||
						"Daily watchlist query limit reached. Please upgrade or try again tomorrow.",
					{
						status: 403,
						body: error.body,
					},
				);
			}
			throw error;
		}
		throw new ApiError(
			`Failed to search watchlist: ${error instanceof Error ? error.message : "Unknown error"}`,
			{ status: 500, body: null },
		);
	}
}
