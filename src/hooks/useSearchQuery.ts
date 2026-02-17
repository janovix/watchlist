/**
 * useSearchQuery Hook
 * Server-Sent Events hook for real-time watchlist query updates.
 * Combines SSE for real-time async results with a polling fallback.
 *
 * Mirrors the pattern in aml/src/hooks/useWatchlistScreening.ts but uses
 * the watchlist project's own API client (getQuery from @/lib/api/queries).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getQuery, type SearchQuery } from "@/lib/api/queries";

export type ConnectionStatus =
	| "disconnected"
	| "connecting"
	| "connected"
	| "error";

export interface UseSearchQueryOptions {
	queryId: string | null | undefined;
	jwt?: string;
	enabled?: boolean;
}

export interface UseSearchQueryResult {
	data: SearchQuery | null;
	isLoading: boolean;
	error: string | null;
	connectionStatus: ConnectionStatus;
	isComplete: boolean;
	refetch: () => Promise<void>;
}

/**
 * All 3 async searches must reach a terminal status before we consider the
 * query fully complete and close the SSE connection.
 */
function checkIfComplete(data: SearchQuery): boolean {
	const done = ["completed", "failed"];
	return (
		done.includes(data.pepOfficialStatus ?? "") &&
		done.includes(data.pepAiStatus ?? "") &&
		done.includes(data.adverseMediaStatus ?? "")
	);
}

export function useSearchQuery({
	queryId,
	jwt,
	enabled = true,
}: UseSearchQueryOptions): UseSearchQueryResult {
	const [data, setData] = useState<SearchQuery | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [connectionStatus, setConnectionStatus] =
		useState<ConnectionStatus>("disconnected");
	const [isComplete, setIsComplete] = useState(false);

	const eventSourceRef = useRef<EventSource | null>(null);
	const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);

	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
	}, []);

	const disconnectSSE = useCallback(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}
	}, []);

	/** Fetch the current query state from REST API */
	const fetchData = useCallback(async () => {
		if (!queryId) return;
		try {
			const response = await getQuery(queryId, { jwt });
			setData(response.result);
			setError(null);
			if (checkIfComplete(response.result)) {
				setIsComplete(true);
			}
		} catch (err) {
			console.error("[useSearchQuery] fetch error:", err);
			setError(err instanceof Error ? err.message : "Failed to load query");
		}
	}, [queryId, jwt]);

	/** Connect to SSE endpoint for async result streaming */
	const connectSSE = useCallback(() => {
		if (!queryId || !enabled) return;

		disconnectSSE();

		const baseUrl =
			process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ??
			"https://watchlist-svc.janovix.workers.dev";

		const url = jwt
			? `${baseUrl}/events/${queryId}?token=${encodeURIComponent(jwt)}`
			: `${baseUrl}/events/${queryId}`;

		setConnectionStatus("connecting");

		try {
			const es = new EventSource(url);
			eventSourceRef.current = es;

			es.onopen = () => {
				setConnectionStatus("connected");
			};

			// PEP Official results
			es.addEventListener("pep_results", (event) => {
				const payload = JSON.parse((event as MessageEvent).data);
				setData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						pepOfficialStatus: "completed" as const,
						pepOfficialResult: payload,
						pepOfficialCount:
							payload.results_sent ?? payload.total_results ?? 0,
					};
				});
			});

			// PEP Official error
			es.addEventListener("pep_error", (event) => {
				const payload = JSON.parse((event as MessageEvent).data);
				setData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						pepOfficialStatus: "failed" as const,
						pepOfficialResult: { error: payload.error },
					};
				});
			});

			// PEP AI (Grok) results
			es.addEventListener("pep_grok_results", (event) => {
				const payload = JSON.parse((event as MessageEvent).data);
				setData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						pepAiStatus: "completed" as const,
						pepAiResult: payload,
					};
				});
			});

			// PEP AI error
			es.addEventListener("pep_grok_error", (event) => {
				const payload = JSON.parse((event as MessageEvent).data);
				setData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						pepAiStatus: "failed" as const,
						pepAiResult: { error: payload.error },
					};
				});
			});

			// Adverse media results
			es.addEventListener("adverse_media_results", (event) => {
				const payload = JSON.parse((event as MessageEvent).data);
				setData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						adverseMediaStatus: "completed" as const,
						adverseMediaResult: payload,
					};
				});
			});

			// Adverse media error
			es.addEventListener("adverse_media_error", (event) => {
				const payload = JSON.parse((event as MessageEvent).data);
				setData((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						adverseMediaStatus: "failed" as const,
						adverseMediaResult: { error: payload.error },
					};
				});
			});

			es.onerror = () => {
				console.error("[useSearchQuery] SSE connection error");
				setConnectionStatus("error");
				disconnectSSE();
			};
		} catch (err) {
			console.error("[useSearchQuery] Failed to create EventSource:", err);
			setConnectionStatus("error");
		}
	}, [queryId, jwt, enabled, disconnectSSE]);

	/** Start 5-second polling as a fallback */
	const startPolling = useCallback(() => {
		stopPolling();
		pollingIntervalRef.current = setInterval(() => {
			void fetchData();
		}, 5000);
	}, [fetchData, stopPolling]);

	// Initial fetch + SSE connect + polling
	useEffect(() => {
		if (!queryId || !enabled) {
			setConnectionStatus("disconnected");
			setData(null);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		fetchData().then(() => {
			setIsLoading(false);
			connectSSE();
			startPolling();
		});

		return () => {
			disconnectSSE();
			stopPolling();
		};
	}, [
		queryId,
		enabled,
		fetchData,
		connectSSE,
		startPolling,
		disconnectSSE,
		stopPolling,
	]);

	// Auto-close SSE and stop polling once all async searches complete
	useEffect(() => {
		if (isComplete) {
			disconnectSSE();
			stopPolling();
			setConnectionStatus("disconnected");
		}
	}, [isComplete, disconnectSSE, stopPolling]);

	// Keep isComplete in sync when data updates via SSE
	useEffect(() => {
		if (data && !isComplete) {
			if (checkIfComplete(data)) {
				setIsComplete(true);
			}
		}
	}, [data, isComplete]);

	return {
		data,
		isLoading,
		error,
		connectionStatus,
		isComplete,
		refetch: fetchData,
	};
}
