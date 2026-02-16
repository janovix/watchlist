import { fetchJson, ApiError } from "./http";
import type { OfacMatch, UnscMatch, Sat69bMatch } from "./watchlist-search";

/**
 * Query status enum
 */
export type QueryStatus = "pending" | "running" | "completed" | "failed";

/**
 * Search query from GET /queries/:queryId
 */
export interface SearchQuery {
	id: string;
	organizationId: string;
	userId: string | null;
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
	adverseMediaStatus: QueryStatus | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * List queries response
 */
export interface ListQueriesResponse {
	success: boolean;
	result: {
		queries: QueryListItem[];
		total: number;
		page: number;
		pageSize: number;
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
	page?: number;
	pageSize?: number;
	status?: QueryStatus;
}

/**
 * Options for queries API calls
 */
export interface QueriesApiOptions {
	jwt?: string;
}

/**
 * Base URL for the watchlist service API.
 */
function getWatchlistApiBaseUrl(): string {
	return (
		process.env.WATCHLIST_API_BASE_URL ??
		process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ??
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

	if (params?.page) searchParams.set("page", params.page.toString());
	if (params?.pageSize)
		searchParams.set("pageSize", params.pageSize.toString());
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
