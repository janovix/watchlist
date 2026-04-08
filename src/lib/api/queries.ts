import { fetchJson, ApiError } from "./http";
import type { OfacMatch, UnscMatch, Sat69bMatch } from "./watchlist-search";

/**
 * Query status enum
 */
export type QueryStatus =
	| "pending"
	| "running"
	| "completed"
	| "partial"
	| "failed"
	| "skipped";

/**
 * Search query from GET /queries/:queryId
 */
export interface SearchQuery {
	id: string;
	organizationId: string;
	userId: string | null;
	/** Origin of the query (e.g. watchlist_query, aml) */
	source: string;
	/** Resolved user display when userId is an org member */
	userDisplay?: { name: string; image: string | null } | null;
	query: string;
	entityType: string | null;
	birthDate: string | null;
	countries: string[] | null;
	status: QueryStatus;
	// OFAC Sanctions
	ofacStatus: QueryStatus | null;
	ofacResult: { matches: OfacMatch[]; count: number } | null;
	ofacCount: number | null;
	// SAT 69B Sanctions
	sat69bStatus: QueryStatus | null;
	sat69bResult: { matches: Sat69bMatch[]; count: number } | null;
	sat69bCount: number | null;
	// UN Sanctions
	unStatus: QueryStatus | null;
	unResult: { matches: UnscMatch[]; count: number } | null;
	unCount: number | null;
	// PEP Official
	pepOfficialStatus: QueryStatus | null;
	pepOfficialResult: unknown | null;
	pepOfficialCount: number | null;
	// PEP AI
	pepAiStatus: QueryStatus | null;
	pepAiResult: unknown | null;
	// Adverse Media
	adverseMediaStatus: QueryStatus | null;
	adverseMediaResult: unknown | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Query list item (summary without full results)
 */
export interface QueryListItem {
	id: string;
	organizationId: string;
	userId: string | null;
	query: string;
	source: string;
	/** Resolved user display (name + avatar) when userId is an org member */
	userDisplay?: { name: string; image: string | null } | null;
	entityType: string | null;
	birthDate: string | null;
	countries: string[] | null;
	status: QueryStatus;
	ofacStatus: QueryStatus | null;
	ofacCount: number | null;
	sat69bStatus: QueryStatus | null;
	sat69bCount: number | null;
	unStatus: QueryStatus | null;
	unCount: number | null;
	pepOfficialStatus: QueryStatus | null;
	pepOfficialCount: number | null;
	pepAiStatus: QueryStatus | null;
	/** Grok PEP indicates a match (aligns with detail view when official count is zero). */
	pepAiIndicatesMatch?: boolean;
	adverseMediaStatus: QueryStatus | null;
	/** Set when adverse media result has risk_level !== "none" (optional for backward compatibility) */
	adverseMediaHasRisk?: boolean | null;
	/** Adverse media risk level when has risk: low (yellow), medium (orange), high (red) */
	adverseMediaRiskLevel?: "low" | "medium" | "high" | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * List queries response
 */
export interface ListQueriesResponse {
	success: boolean;
	queries: QueryListItem[];
	pagination: {
		limit: number;
		offset: number;
		total: number;
		hasMore: boolean;
	};
}

/**
 * Get query response
 */
export interface GetQueryResponse {
	success: boolean;
	result: SearchQuery;
}

/**
 * List queries parameters
 */
export interface ListQueriesParams {
	limit?: number;
	offset?: number;
	status?: QueryStatus;
}

/**
 * Options for queries API calls
 */
export interface QueriesApiOptions {
	jwt?: string;
}

/**
 * Base URL for the watchlist service API (client-side).
 * Uses the public/external URL for browser requests.
 */
function getWatchlistApiBaseUrl(): string {
	return (
		process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ||
		"https://watchlist-svc.janovix.workers.dev"
	);
}

/**
 * List queries for the authenticated organization
 */
export async function listQueries(
	params?: ListQueriesParams,
	options?: QueriesApiOptions,
): Promise<ListQueriesResponse> {
	const baseUrl = getWatchlistApiBaseUrl();
	const searchParams = new URLSearchParams();

	if (params?.limit) searchParams.set("limit", params.limit.toString());
	if (params?.offset) searchParams.set("offset", params.offset.toString());
	if (params?.status) searchParams.set("status", params.status);

	const url = `${baseUrl}/queries?${searchParams.toString()}`;

	const { json } = await fetchJson<ListQueriesResponse>(url, {
		method: "GET",
		jwt: options?.jwt,
	});

	if (!json.success) {
		throw new ApiError("Failed to list queries", { status: 500, body: json });
	}

	return json;
}

/**
 * Get a single query by ID
 */
export async function getQuery(
	queryId: string,
	options?: QueriesApiOptions,
): Promise<GetQueryResponse> {
	const baseUrl = getWatchlistApiBaseUrl();
	const url = `${baseUrl}/queries/${queryId}`;

	const { json } = await fetchJson<GetQueryResponse>(url, {
		method: "GET",
		jwt: options?.jwt,
	});

	if (!json.success) {
		throw new ApiError("Failed to get query", { status: 500, body: json });
	}

	return json;
}
