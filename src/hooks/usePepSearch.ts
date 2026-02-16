import { useEffect, useState, useRef, useCallback } from "react";

/**
 * PEP raw result from the Transparency Platform API
 */
export interface PepRawResult {
	id: string;
	nombre: string;
	entidadfederativa?: string;
	sujetoobligado?: string;
	denominacion?: string;
	areaadscripcion?: string;
	periodoreporta?: string;
	informacionPrincipal?: {
		nombre?: string;
		institucion?: string;
		cargo?: string;
		area?: string;
		telefono?: string;
		correo?: string;
		direccion?: string;
		periodoinforma?: string;
	};
	complementoPrincipal?: {
		nombre?: string;
		primerApellido?: string;
		segundoApellido?: string;
		entidadFederativa?: string;
		sujetoObligado?: string;
		denominacionCargo?: string;
		areaAdscripcion?: string;
		ejercicio?: number;
		anioFechaInicio?: number;
		fechaInicioPeriodo?: string;
		fechaFinPeriodo?: string;
	};
	[key: string]: unknown;
}

/**
 * PEP search event from SSE
 */
export interface PepSearchEvent {
	search_id: string;
	query: string;
	total_results: number;
	total_pages: number;
	results: PepRawResult[];
	results_sent: number;
	status: "completed";
	completed_at: string;
}

/**
 * PEP error event from SSE
 */
export interface PepErrorEvent {
	search_id: string;
	status: "failed";
	error: string;
	failed_at: string;
}

/**
 * Hook to subscribe to PEP search results via SSE
 */
export function usePepSearch(searchId: string | null, enabled = true) {
	const [results, setResults] = useState<PepRawResult[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const eventSourceRef = useRef<EventSource | null>(null);

	const disconnect = useCallback(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}
	}, []);

	useEffect(() => {
		if (!searchId || !enabled) {
			disconnect();
			return;
		}

		setIsLoading(true);
		setError(null);

		// Get base URL for watchlist service (client-side URL for EventSource)
		const baseUrl =
			process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ??
			"https://watchlist-svc.janovix.workers.dev";

		const url = `${baseUrl}/pep/events/${searchId}`;

		try {
			const eventSource = new EventSource(url);
			eventSourceRef.current = eventSource;

			// Handle PEP results event
			eventSource.addEventListener("pep_results", (event) => {
				try {
					const data = JSON.parse(event.data) as PepSearchEvent;
					setResults(data.results);
					setIsLoading(false);
					disconnect();
				} catch (err) {
					console.error("[usePepSearch] Failed to parse pep_results:", err);
					setError("Failed to parse PEP results");
					setIsLoading(false);
					disconnect();
				}
			});

			// Handle PEP error event
			eventSource.addEventListener("pep_error", (event) => {
				try {
					const data = JSON.parse(event.data) as PepErrorEvent;
					setError(data.error);
					setIsLoading(false);
					disconnect();
				} catch (err) {
					console.error("[usePepSearch] Failed to parse pep_error:", err);
					setError("PEP search failed");
					setIsLoading(false);
					disconnect();
				}
			});

			// Handle connection errors
			eventSource.onerror = () => {
				console.error("[usePepSearch] SSE connection error");
				setError("Connection to PEP search failed");
				setIsLoading(false);
				disconnect();
			};
		} catch (err) {
			console.error("[usePepSearch] Failed to create EventSource:", err);
			setError("Failed to connect to PEP search");
			setIsLoading(false);
		}

		// Cleanup on unmount or searchId change
		return () => {
			disconnect();
		};
	}, [searchId, enabled, disconnect]);

	return {
		results,
		error,
		isLoading,
		disconnect,
	};
}
