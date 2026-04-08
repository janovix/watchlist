import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSearchQuery, type ProgressMessages } from "./useSearchQuery";
import type { SearchQuery } from "@/lib/api/queries";

// Mock EventSource
class MockEventSource {
	url: string;
	listeners: Map<string, ((event: MessageEvent) => void)[]>;
	onerror: ((event: Event) => void) | null = null;
	onopen: ((event: Event) => void) | null = null;
	readyState = 0;

	constructor(url: string) {
		this.url = url;
		this.listeners = new Map();
		setTimeout(() => {
			this.readyState = 1;
		}, 0);
	}

	triggerOpen() {
		this.onopen?.(new Event("open"));
	}

	triggerTransportError() {
		this.onerror?.(new Event("error"));
	}

	addEventListener(event: string, listener: (event: MessageEvent) => void) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}
		this.listeners.get(event)?.push(listener);
	}

	removeEventListener(
		_event: string,
		_listener: (event: MessageEvent) => void,
	) {
		// no-op for tests
	}

	close() {
		this.readyState = 2;
		this.listeners.clear();
	}

	triggerEvent(eventType: string, data: string) {
		const listeners = this.listeners.get(eventType);
		if (listeners) {
			const event = new MessageEvent(eventType, { data });
			listeners.forEach((listener) => listener(event));
		}
	}
}

function minimalSearchQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
	return {
		id: "query-123",
		organizationId: "org-1",
		userId: "user-1",
		source: "watchlist_query",
		userDisplay: null,
		query: "Test Person",
		entityType: "person",
		birthDate: null,
		countries: null,
		status: "running",
		ofacStatus: "completed",
		ofacResult: { matches: [], count: 0 },
		ofacCount: 0,
		sat69bStatus: "completed",
		sat69bResult: { matches: [], count: 0 },
		sat69bCount: 0,
		unStatus: "completed",
		unResult: { matches: [], count: 0 },
		unCount: 0,
		pepOfficialStatus: "pending",
		pepOfficialResult: null,
		pepOfficialCount: null,
		pepAiStatus: "pending",
		pepAiResult: null,
		adverseMediaStatus: "pending",
		adverseMediaResult: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}

vi.mock("@/lib/api/queries", () => ({
	getQuery: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
	requireEnv: vi.fn(() => "http://local.test"),
}));

const mockGetToken = vi.fn((_forceRefresh?: boolean) =>
	Promise.resolve<string | null>(null),
);

vi.mock("@/lib/auth/tokenCache", () => ({
	tokenCache: {
		getToken: (forceRefresh?: boolean) => mockGetToken(forceRefresh),
	},
}));

describe("useSearchQuery", () => {
	let mockEventSource: MockEventSource | null = null;

	beforeEach(async () => {
		vi.clearAllMocks();
		mockGetToken.mockResolvedValue(null);
		mockEventSource = null;

		const { getQuery } = await import("@/lib/api/queries");
		vi.mocked(getQuery).mockResolvedValue({
			success: true,
			result: minimalSearchQuery(),
		});

		global.EventSource = class {
			constructor(url: string) {
				const instance = new MockEventSource(url);
				mockEventSource = instance;
				return instance as unknown as EventSource;
			}
		} as typeof EventSource;
	});

	afterEach(() => {
		mockEventSource?.close();
	});

	it("returns progressMessages in result with initial null values", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(result.current.data).not.toBeNull();
			expect(result.current.isLoading).toBe(false);
		});

		const expected: ProgressMessages = {
			pepGrok: null,
			adverseMedia: null,
			pepOfficial: null,
		};
		expect(result.current.progressMessages).toEqual(expected);
	});

	it("updates progressMessages.pepGrok when pep_grok_progress event is received", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
			expect(result.current.data).not.toBeNull();
		});

		act(() => {
			mockEventSource?.triggerEvent(
				"pep_grok_progress",
				JSON.stringify({ message: "Searching websites..." }),
			);
		});

		await waitFor(() => {
			expect(result.current.progressMessages.pepGrok).toBe(
				"Searching websites...",
			);
			expect(result.current.progressMessages.adverseMedia).toBeNull();
		});

		act(() => {
			mockEventSource?.triggerEvent(
				"pep_grok_progress",
				JSON.stringify({ phase: "thinking", message: "Thinking..." }),
			);
		});

		await waitFor(() => {
			expect(result.current.progressMessages.pepGrok).toBe("Thinking...");
		});
	});

	it("updates progressMessages.adverseMedia when adverse_media_progress event is received", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		act(() => {
			mockEventSource?.triggerEvent(
				"adverse_media_progress",
				JSON.stringify({ message: "Analyzing..." }),
			);
		});

		await waitFor(() => {
			expect(result.current.progressMessages.adverseMedia).toBe("Analyzing...");
		});
	});

	it("clears progressMessages.pepGrok when pep_grok_results is received", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => expect(mockEventSource).not.toBeNull());

		act(() => {
			mockEventSource?.triggerEvent(
				"pep_grok_progress",
				JSON.stringify({ message: "Searching..." }),
			);
		});
		await waitFor(() => {
			expect(result.current.progressMessages.pepGrok).toBe("Searching...");
		});

		act(() => {
			mockEventSource?.triggerEvent(
				"pep_grok_results",
				JSON.stringify({
					search_id: "query-123",
					probability: 0.5,
					summary: { es: "", en: "" },
					sources: [],
				}),
			);
		});

		await waitFor(() => {
			expect(result.current.progressMessages.pepGrok).toBeNull();
			expect(result.current.data?.pepAiStatus).toBe("completed");
		});
	});

	it("clears progressMessages.adverseMedia when adverse_media_results is received", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => expect(mockEventSource).not.toBeNull());

		act(() => {
			mockEventSource?.triggerEvent(
				"adverse_media_progress",
				JSON.stringify({ message: "Analyzing..." }),
			);
		});
		await waitFor(() => {
			expect(result.current.progressMessages.adverseMedia).toBe("Analyzing...");
		});

		act(() => {
			mockEventSource?.triggerEvent(
				"adverse_media_results",
				JSON.stringify({
					search_id: "query-123",
					risk_level: "none",
					findings: { es: "", en: "" },
					sources: [],
				}),
			);
		});

		await waitFor(() => {
			expect(result.current.progressMessages.adverseMedia).toBeNull();
			expect(result.current.data?.adverseMediaStatus).toBe("completed");
		});
	});

	it("uses phase when message is missing in progress payload", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => expect(mockEventSource).not.toBeNull());

		act(() => {
			mockEventSource?.triggerEvent(
				"pep_grok_progress",
				JSON.stringify({ phase: "searching" }),
			);
		});

		await waitFor(() => {
			expect(result.current.progressMessages.pepGrok).toBe("searching");
		});
	});

	it("does not fetch when queryId is missing", () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: undefined, enabled: true }),
		);
		expect(result.current.data).toBeNull();
		expect(result.current.connectionStatus).toBe("disconnected");
	});

	it("does not fetch when enabled is false", () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: false }),
		);
		expect(result.current.connectionStatus).toBe("disconnected");
	});

	it("includes JWT in EventSource URL when jwt is provided", async () => {
		renderHook(() =>
			useSearchQuery({
				queryId: "query-123",
				jwt: "my-token",
				enabled: true,
			}),
		);
		await waitFor(() => {
			expect(mockEventSource?.url).toContain("token=");
			expect(mockEventSource?.url).toContain(encodeURIComponent("my-token"));
		});
	});

	it("sets connectionStatus to connected when SSE opens", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerOpen();
		});
		await waitFor(() => {
			expect(result.current.connectionStatus).toBe("connected");
		});
	});

	it("sets connectionStatus to error on SSE transport error", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerTransportError();
		});
		await waitFor(() => {
			expect(result.current.connectionStatus).toBe("error");
		});
	});

	it("applies pep_results event to data", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerEvent(
				"pep_results",
				JSON.stringify({
					results_sent: 2,
					total_results: 2,
					items: [],
				}),
			);
		});
		await waitFor(() => {
			expect(result.current.data?.pepOfficialStatus).toBe("completed");
			expect(result.current.data?.pepOfficialCount).toBe(2);
		});
	});

	it("applies pep_error event to data", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerEvent(
				"pep_error",
				JSON.stringify({ error: "upstream failed" }),
			);
		});
		await waitFor(() => {
			expect(result.current.data?.pepOfficialStatus).toBe("failed");
		});
	});

	it("applies pep_grok_error event", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerEvent(
				"pep_grok_error",
				JSON.stringify({ error: "grok failed" }),
			);
		});
		await waitFor(() => {
			expect(result.current.data?.pepAiStatus).toBe("failed");
		});
	});

	it("applies adverse_media_error event", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerEvent(
				"adverse_media_error",
				JSON.stringify({ error: "media failed" }),
			);
		});
		await waitFor(() => {
			expect(result.current.data?.adverseMediaStatus).toBe("failed");
		});
	});

	it("ignores invalid JSON in pep_grok_progress", async () => {
		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);
		await waitFor(() => expect(mockEventSource).not.toBeNull());
		act(() => {
			mockEventSource?.triggerEvent("pep_grok_progress", "not-json{{{");
		});
		await waitFor(() => {
			expect(result.current.progressMessages.pepGrok).toBeNull();
		});
	});

	it("sets error when getQuery fails with non-401 error", async () => {
		const { getQuery } = await import("@/lib/api/queries");
		vi.mocked(getQuery).mockRejectedValueOnce(new Error("network down"));

		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(result.current.error).toBe("network down");
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("retries once on 401 with refreshed token", async () => {
		const { getQuery } = await import("@/lib/api/queries");
		const { ApiError } = await import("@/lib/api/http");
		mockGetToken.mockResolvedValueOnce("fresh-jwt");

		vi.mocked(getQuery)
			.mockRejectedValueOnce(
				new ApiError("Unauthorized", { status: 401, body: null }),
			)
			.mockResolvedValueOnce({
				success: true,
				result: minimalSearchQuery(),
			});

		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(getQuery).toHaveBeenCalledTimes(2);
			expect(mockGetToken).toHaveBeenCalledWith(true);
			expect(result.current.data).not.toBeNull();
			expect(result.current.error).toBeNull();
		});
	});

	it("sets connection error when EventSource constructor throws", async () => {
		global.EventSource = class extends EventTarget {
			static CONNECTING = 0;
			static OPEN = 1;
			static CLOSED = 2;
			constructor() {
				super();
				throw new Error("EventSource unavailable");
			}
		} as unknown as typeof EventSource;

		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(result.current.connectionStatus).toBe("error");
		});
	});

	it("marks isComplete when initial query has all async streams terminal", async () => {
		const { getQuery } = await import("@/lib/api/queries");
		vi.mocked(getQuery).mockResolvedValue({
			success: true,
			result: minimalSearchQuery({
				pepOfficialStatus: "completed",
				pepAiStatus: "completed",
				adverseMediaStatus: "completed",
			}),
		});

		const { result } = renderHook(() =>
			useSearchQuery({ queryId: "query-123", enabled: true }),
		);

		await waitFor(() => {
			expect(result.current.isComplete).toBe(true);
		});
	});
});
