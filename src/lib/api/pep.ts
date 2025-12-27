import { fetchJson, ApiError } from "./http";

/**
 * PEP evaluation request body
 */
export interface PEPEvaluationRequest {
	fullName: string;
	birthDate?: string;
	country?: string;
	knownAliases?: string[];
	occupation?: string;
	additionalContext?: string;
	useHybrid?: boolean;
}

/**
 * PEP evaluation response from API
 */
export interface PEPEvaluationApiResponse {
	success: boolean;
	result: {
		isPEP: boolean;
		confidence: "high" | "medium" | "low" | "requires_verification";
		currentPosition: string | null;
		country: string | null;
		evidence: string[];
		reasoning: string;
		source: "ai" | "watchlist" | "gk";
	};
}

/**
 * Legacy PepRecord interface for backward compatibility
 */
export interface PepRecord {
	dataset: string; // e.g., OFAC, UN, EU, or source like "ai", "watchlist", "gk"
	id: string;
	name: string;
	aliases: string[];
	birthDate: string | null;
	countries: string[];
	firstSeen: string | null;
	lastChange: string | null;
	lastSeen: string | null;
	currentPosition: string | null;
}

/**
 * Transformed response for UI
 */
export interface PEPEvaluationResponse {
	isPep: boolean;
	record: PepRecord | null;
	confidence: "high" | "medium" | "low" | "requires_verification";
	currentPosition: string | null;
	evidence: string[];
	reasoning: string;
	source: "ai" | "watchlist" | "gk";
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
 * Options for PEP evaluation
 */
export interface EvaluatePEPOptions {
	/**
	 * JWT token to include in Authorization header.
	 * When provided, adds `Authorization: Bearer <jwt>` header.
	 */
	jwt?: string;
}

/**
 * Evaluate if a person is a PEP (Politically Exposed Person).
 *
 * @param request - The evaluation request with person information
 * @param options - Optional configuration including JWT token
 * @returns Promise resolving to the evaluation result
 * @throws ApiError if the request fails
 */
export async function evaluatePEP(
	request: PEPEvaluationRequest,
	options?: EvaluatePEPOptions,
): Promise<PEPEvaluationResponse> {
	const baseUrl = getWatchlistApiBaseUrl();
	const url = `${baseUrl}/pep/evaluate`;

	try {
		const { json } = await fetchJson<PEPEvaluationApiResponse>(url, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify(request),
			jwt: options?.jwt,
		});

		// Check if API response indicates success
		if (!json.success) {
			throw new ApiError("API returned unsuccessful response", {
				status: 500,
				body: json,
			});
		}

		const { result } = json;

		// Transform API response to UI format
		if (result.isPEP) {
			// Create a record for PEP results
			const record: PepRecord = {
				dataset: result.source.toUpperCase(),
				id: `${result.source}-${crypto.randomUUID().slice(0, 8)}`,
				name: request.fullName,
				aliases: request.knownAliases || [],
				birthDate: request.birthDate || null,
				countries: result.country ? [result.country] : [],
				firstSeen: null,
				lastChange: null,
				lastSeen: null,
				currentPosition: result.currentPosition,
			};

			return {
				isPep: true,
				record,
				confidence: result.confidence,
				currentPosition: result.currentPosition,
				evidence: result.evidence,
				reasoning: result.reasoning,
				source: result.source,
			};
		} else {
			return {
				isPep: false,
				record: null,
				confidence: result.confidence,
				currentPosition: null,
				evidence: result.evidence,
				reasoning: result.reasoning,
				source: result.source,
			};
		}
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError(
			`Failed to evaluate PEP: ${error instanceof Error ? error.message : "Unknown error"}`,
			{ status: 500, body: null },
		);
	}
}
