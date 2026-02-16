import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
	usePepSearch,
	type PepSearchEvent,
	type PepErrorEvent,
} from "./usePepSearch";

// Mock EventSource
class MockEventSource {
	url: string;
	listeners: Map<string, ((event: MessageEvent) => void)[]>;
	onerror: ((event: Event) => void) | null = null;
	readyState = 0;

	constructor(url: string) {
		this.url = url;
		this.listeners = new Map();
		// Simulate connection opening
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

	removeEventListener(event: string, listener: (event: MessageEvent) => void) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			const index = eventListeners.indexOf(listener);
			if (index > -1) {
				eventListeners.splice(index, 1);
			}
		}
	}

	close() {
		this.readyState = 2;
		this.listeners.clear();
	}

	// Helper to trigger events in tests
	triggerEvent(eventType: string, data: string) {
		const listeners = this.listeners.get(eventType);
		if (listeners) {
			const event = new MessageEvent(eventType, { data });
			listeners.forEach((listener) => listener(event));
		}
	}

	// Helper to trigger error
	triggerError() {
		if (this.onerror) {
			this.onerror(new Event("error"));
		}
	}
}

describe("usePepSearch", () => {
	let mockEventSource: MockEventSource | null = null;
	let eventSourceInstances: MockEventSource[] = [];

	beforeEach(() => {
		vi.clearAllMocks();
		mockEventSource = null;
		eventSourceInstances = [];

		// Mock global EventSource as a class constructor
		global.EventSource = class {
			constructor(url: string) {
				const instance = new MockEventSource(url);
				mockEventSource = instance;
				eventSourceInstances.push(instance);
				return instance as any;
			}
		} as any;
	});

	afterEach(() => {
		mockEventSource?.close();
	});

	it("returns isLoading false when searchId is null", () => {
		const { result } = renderHook(() => usePepSearch(null));

		expect(result.current.isLoading).toBe(false);
		expect(result.current.results).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it("returns isLoading false when enabled is false", () => {
		const { result } = renderHook(() => usePepSearch("search-123", false));

		expect(result.current.isLoading).toBe(false);
		expect(result.current.results).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it("creates EventSource with correct URL when searchId provided", async () => {
		renderHook(() => usePepSearch("search-123"));

		// Wait for EventSource to be created
		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
			expect(mockEventSource?.url).toContain("/pep/events/search-123");
		});
	});

	it("sets isLoading to true initially", () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		expect(result.current.isLoading).toBe(true);
	});

	it("sets results on pep_results event", async () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		const mockResults: PepSearchEvent = {
			search_id: "search-123",
			query: "Juan Perez",
			total_results: 2,
			total_pages: 1,
			results: [
				{
					id: "pep-1",
					nombre: "Juan Perez",
					entidadfederativa: "CDMX",
				},
				{
					id: "pep-2",
					nombre: "Juan Perez Garcia",
					entidadfederativa: "Jalisco",
				},
			],
			results_sent: 2,
			status: "completed",
			completed_at: "2024-01-01T00:00:00Z",
		};

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		mockEventSource?.triggerEvent("pep_results", JSON.stringify(mockResults));

		await waitFor(() => {
			expect(result.current.results).toHaveLength(2);
			expect(result.current.results?.[0].id).toBe("pep-1");
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});
	});

	it("sets error on pep_error event", async () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		const mockError: PepErrorEvent = {
			search_id: "search-123",
			status: "failed",
			error: "Search timeout",
			failed_at: "2024-01-01T00:00:00Z",
		};

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		mockEventSource?.triggerEvent("pep_error", JSON.stringify(mockError));

		await waitFor(() => {
			expect(result.current.error).toBe("Search timeout");
			expect(result.current.isLoading).toBe(false);
			expect(result.current.results).toBeNull();
		});
	});

	it("sets error on connection error", async () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		mockEventSource?.triggerError();

		await waitFor(() => {
			expect(result.current.error).toBe("Connection to PEP search failed");
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("disconnects on unmount", async () => {
		const { unmount } = renderHook(() => usePepSearch("search-123"));

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		const closeSpy = vi.spyOn(mockEventSource!, "close");

		unmount();

		expect(closeSpy).toHaveBeenCalled();
	});

	it("disconnects when enabled is set to false", async () => {
		const { rerender } = renderHook(
			({ enabled }) => usePepSearch("search-123", enabled),
			{ initialProps: { enabled: true } },
		);

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		const closeSpy = vi.spyOn(mockEventSource!, "close");

		rerender({ enabled: false });

		await waitFor(() => {
			expect(closeSpy).toHaveBeenCalled();
		});
	});

	it("disconnects when searchId changes", async () => {
		const { rerender } = renderHook(({ searchId }) => usePepSearch(searchId), {
			initialProps: { searchId: "search-123" },
		});

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		const firstEventSource = mockEventSource;
		const closeSpy = vi.spyOn(firstEventSource!, "close");

		rerender({ searchId: "search-456" });

		await waitFor(() => {
			expect(closeSpy).toHaveBeenCalled();
		});
	});

	it("disconnects after receiving results", async () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		const mockResults: PepSearchEvent = {
			search_id: "search-123",
			query: "Test",
			total_results: 1,
			total_pages: 1,
			results: [{ id: "pep-1", nombre: "Test" }],
			results_sent: 1,
			status: "completed",
			completed_at: "2024-01-01T00:00:00Z",
		};

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		const closeSpy = vi.spyOn(mockEventSource!, "close");

		mockEventSource?.triggerEvent("pep_results", JSON.stringify(mockResults));

		await waitFor(() => {
			expect(result.current.results).not.toBeNull();
			expect(closeSpy).toHaveBeenCalled();
		});
	});

	it("disconnects after receiving error", async () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		const mockError: PepErrorEvent = {
			search_id: "search-123",
			status: "failed",
			error: "Test error",
			failed_at: "2024-01-01T00:00:00Z",
		};

		await waitFor(() => {
			expect(mockEventSource).not.toBeNull();
		});

		const closeSpy = vi.spyOn(mockEventSource!, "close");

		mockEventSource?.triggerEvent("pep_error", JSON.stringify(mockError));

		await waitFor(() => {
			expect(result.current.error).not.toBeNull();
			expect(closeSpy).toHaveBeenCalled();
		});
	});

	it("handles invalid JSON in pep_results event", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { result } = renderHook(() => usePepSearch("search-123"));

		// Wait for EventSource to be created
		await waitFor(() => expect(mockEventSource).not.toBeNull());

		// Now mockEventSource should be set
		if (!mockEventSource) {
			throw new Error("mockEventSource was not created");
		}

		mockEventSource.triggerEvent("pep_results", "invalid json");

		await waitFor(() => {
			expect(result.current.error).toBe("Failed to parse PEP results");
			expect(result.current.isLoading).toBe(false);
		});

		consoleErrorSpy.mockRestore();
	});

	it("handles invalid JSON in pep_error event", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { result } = renderHook(() => usePepSearch("search-123"));

		// Wait for EventSource to be created
		await waitFor(() => expect(mockEventSource).not.toBeNull());

		// Now mockEventSource should be set
		if (!mockEventSource) {
			throw new Error("mockEventSource was not created");
		}

		mockEventSource.triggerEvent("pep_error", "invalid json");

		await waitFor(() => {
			expect(result.current.error).toBe("PEP search failed");
			expect(result.current.isLoading).toBe(false);
		});

		consoleErrorSpy.mockRestore();
	});

	it("exposes disconnect function", () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		expect(typeof result.current.disconnect).toBe("function");
	});

	it("allows manual disconnect via returned function", async () => {
		const { result } = renderHook(() => usePepSearch("search-123"));

		// Wait for EventSource to be created
		await waitFor(() => expect(mockEventSource).not.toBeNull());

		// Now mockEventSource should be set
		if (!mockEventSource) {
			throw new Error("mockEventSource was not created");
		}

		const closeSpy = vi.spyOn(mockEventSource, "close");

		result.current.disconnect();

		expect(closeSpy).toHaveBeenCalled();
	});
});
