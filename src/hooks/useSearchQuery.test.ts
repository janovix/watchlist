import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSearchQuery, type ProgressMessages } from "./useSearchQuery";
import type { SearchQuery } from "@/lib/api/queries";

// Mock EventSource
class MockEventSource {
	url: string;
	listeners: Map<string, ((event: MessageEvent) => void)[]>;
	onerror: ((event: Event) => void) | null = null;
	readyState = 0;

	constructor(url: string) {
		this.url = url;
		this.listeners = new Map();
		setTimeout(() => {
			this.readyState = 1;
		}, 0);
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

vi.mock("@/lib/auth/tokenCache", () => ({
	tokenCache: { getToken: vi.fn(() => Promise.resolve(null)) },
}));

describe("useSearchQuery", () => {
	let mockEventSource: MockEventSource | null = null;

	beforeEach(async () => {
		vi.clearAllMocks();
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
});
