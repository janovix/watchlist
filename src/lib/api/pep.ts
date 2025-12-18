import { fetchJson, ApiError } from "./http";

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

export interface PepSearchRequest {
	name: string;
}

export interface PepSearchResponse {
	isPep: boolean;
	record: PepRecord | null;
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
 * Search for a PEP (Politically Exposed Person) by name.
 *
 * @param name - The name to search for
 * @returns Promise resolving to the search result
 * @throws ApiError if the request fails
 */
export async function searchPep(name: string): Promise<PepSearchResponse> {
	const baseUrl = getWatchlistApiBaseUrl();
	const url = `${baseUrl}/pep/search`;

	try {
		const { json } = await fetchJson<PepSearchResponse>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ name }),
		});

		return json;
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
