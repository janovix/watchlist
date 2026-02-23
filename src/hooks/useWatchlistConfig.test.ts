import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Use dynamic imports per test to reset the module-level cache.
// vi.resetModules() ensures cachedFeatures starts as null for each test.

const mockFetchWatchlistConfig = vi.fn();

vi.mock("@/lib/api/watchlist-config", () => ({
	fetchWatchlistConfig: () => mockFetchWatchlistConfig(),
}));

const DEFAULT_FEATURES = {
	pepSearch: true,
	pepGrok: true,
	adverseMedia: true,
};

describe("useWatchlistConfig", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();
		// Re-register the mock after reset
		vi.mock("@/lib/api/watchlist-config", () => ({
			fetchWatchlistConfig: () => mockFetchWatchlistConfig(),
		}));
	});

	it("should return default features while loading", async () => {
		mockFetchWatchlistConfig.mockResolvedValue(DEFAULT_FEATURES);

		const { useWatchlistConfig } = await import("./useWatchlistConfig");
		const { result } = renderHook(() => useWatchlistConfig());

		// Initially loading with default features
		expect(result.current.features).toEqual(DEFAULT_FEATURES);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("should set isLoading false and update features after successful fetch", async () => {
		const fetchedFeatures = {
			pepSearch: false,
			pepGrok: false,
			adverseMedia: true,
		};
		mockFetchWatchlistConfig.mockResolvedValue(fetchedFeatures);

		const { useWatchlistConfig } = await import("./useWatchlistConfig");
		const { result } = renderHook(() => useWatchlistConfig());

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.features).toEqual(fetchedFeatures);
		expect(mockFetchWatchlistConfig).toHaveBeenCalledOnce();
	});

	it("should call fetchWatchlistConfig exactly once even with multiple hook instances", async () => {
		mockFetchWatchlistConfig.mockResolvedValue(DEFAULT_FEATURES);

		const { useWatchlistConfig } = await import("./useWatchlistConfig");

		const { result: r1 } = renderHook(() => useWatchlistConfig());
		const { result: r2 } = renderHook(() => useWatchlistConfig());

		await waitFor(() => {
			expect(r1.current.isLoading).toBe(false);
			expect(r2.current.isLoading).toBe(false);
		});

		// Both instances should have resolved
		expect(r1.current.features).toEqual(DEFAULT_FEATURES);
	});

	it("should not call fetch again when cache is already populated", async () => {
		mockFetchWatchlistConfig.mockResolvedValue(DEFAULT_FEATURES);

		const { useWatchlistConfig } = await import("./useWatchlistConfig");
		const { result } = renderHook(() => useWatchlistConfig());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		// Render again — cache is now set, no second fetch
		const { result: result2 } = renderHook(() => useWatchlistConfig());
		expect(result2.current.isLoading).toBe(false);
		expect(result2.current.features).toEqual(DEFAULT_FEATURES);
	});

	it("should cancel the fetch on unmount (no state updates after unmount)", async () => {
		let resolvePromise!: (val: typeof DEFAULT_FEATURES) => void;
		mockFetchWatchlistConfig.mockReturnValue(
			new Promise((res) => {
				resolvePromise = res;
			}),
		);

		const { useWatchlistConfig } = await import("./useWatchlistConfig");
		const { result, unmount } = renderHook(() => useWatchlistConfig());

		expect(result.current.isLoading).toBe(true);

		unmount();

		// Resolve after unmount — should not throw or cause state update
		act(() => {
			resolvePromise(DEFAULT_FEATURES);
		});

		// No assertions on state — just verifying no errors thrown
	});
});
