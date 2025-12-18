import { fetchJson, ApiError } from "./http";

/**
 * Watchlist target from the API
 */
export interface WatchlistTarget {
	id: string;
	schema: string | null;
	name: string | null;
	aliases: string[] | null;
	birthDate: string | null;
	countries: string[] | null;
	addresses: string[] | null;
	identifiers: string[] | null;
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
 * PEP search request body
 */
export interface PepSearchRequest {
	query: string;
}

/**
 * PEP search response from API
 */
export interface PepSearchApiResponse {
	success: boolean;
	result: {
		target: WatchlistTarget;
		pepStatus: boolean;
		pepDetails: string;
		matchConfidence: "exact" | "possible";
	};
}

/**
 * Legacy PepRecord interface for backward compatibility
 * Maps from WatchlistTarget to the existing format
 */
export interface PepRecord {
	dataset: string; // e.g., OFAC, UN, EU
	id: string;
	name: string;
	aliases: string[];
	birthDate: string | null;
	countries: string[];
	firstSeen: string | null;
	lastChange: string | null;
	lastSeen: string | null;
}

/**
 * Transformed response for backward compatibility
 */
export interface PepSearchResponse {
	isPep: boolean;
	record: PepRecord | null;
	matchConfidence?: "exact" | "possible";
	pepDetails?: string;
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
 * Maps WatchlistTarget to legacy PepRecord format
 */
function mapTargetToPepRecord(target: WatchlistTarget): PepRecord {
	return {
		dataset: target.dataset || "UNKNOWN",
		id: target.id,
		name: target.name || "Unknown",
		aliases: target.aliases || [],
		birthDate: target.birthDate,
		countries: target.countries || [],
		firstSeen: target.firstSeen,
		lastChange: target.lastChange,
		lastSeen: target.lastSeen,
	};
}

/**
 * Search for a PEP (Politically Exposed Person) by query.
 *
 * @param query - The search query (name or other identifying information)
 * @returns Promise resolving to the search result
 * @throws ApiError if the request fails
 */
export async function searchPep(query: string): Promise<PepSearchResponse> {
	const baseUrl = getWatchlistApiBaseUrl();
	const url = `${baseUrl}/pep/search`;

	try {
		const { json } = await fetchJson<PepSearchApiResponse>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ query }),
		});

		// Check if API response indicates success
		if (!json.success) {
			throw new ApiError("API returned unsuccessful response", {
				status: 500,
				body: json,
			});
		}

		const { result } = json;

		// Transform API response to legacy format
		return {
			isPep: result.pepStatus,
			record: result.pepStatus ? mapTargetToPepRecord(result.target) : null,
			matchConfidence: result.matchConfidence,
			pepDetails: result.pepDetails,
		};
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(
			`Failed to search PEP: ${error instanceof Error ? error.message : "Unknown error"}`,
			{ status: 500, body: null },
		);
	}
}
