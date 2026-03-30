import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useJwt } from "./useJwt";
import { tokenCache } from "@/lib/auth/tokenCache";

vi.mock("@/lib/auth/tokenCache", () => ({
	tokenCache: {
		getToken: vi.fn(),
		clear: vi.fn(),
	},
}));

describe("useJwt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should fetch JWT on mount via tokenCache", async () => {
		const mockJwt = "test-jwt-token";
		vi.mocked(tokenCache.getToken).mockResolvedValue(mockJwt);

		const { result } = renderHook(() => useJwt());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.jwt).toBe(null);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(mockJwt);
		expect(result.current.error).toBe(null);
		expect(tokenCache.getToken).toHaveBeenCalledOnce();
		expect(tokenCache.getToken).toHaveBeenCalledWith(false);
	});

	it("should handle JWT fetch error", async () => {
		const mockError = new Error("Failed to fetch JWT");
		vi.mocked(tokenCache.getToken).mockRejectedValue(mockError);

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(null);
		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.error?.message).toBe("Failed to fetch JWT");
	});

	it("should handle null JWT response", async () => {
		vi.mocked(tokenCache.getToken).mockResolvedValue(null);

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(null);
		expect(result.current.error).toBe(null);
	});

	it("should handle non-Error rejection", async () => {
		vi.mocked(tokenCache.getToken).mockRejectedValue("String error");

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(null);
		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.error?.message).toBe("Failed to fetch JWT");
	});

	it("should force-refresh when refetch is called", async () => {
		const mockJwt = "test-jwt-token";
		vi.mocked(tokenCache.getToken).mockResolvedValue(mockJwt);

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(tokenCache.getToken).toHaveBeenCalledTimes(1);
		expect(tokenCache.getToken).toHaveBeenLastCalledWith(false);

		await act(() => result.current.refetch());

		expect(tokenCache.getToken).toHaveBeenCalledTimes(2);
		expect(tokenCache.getToken).toHaveBeenLastCalledWith(true);
	});

	it("refetches when document becomes visible", async () => {
		vi.mocked(tokenCache.getToken).mockResolvedValue("jwt-1");

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(tokenCache.getToken).toHaveBeenCalledTimes(1);

		vi.mocked(tokenCache.getToken).mockResolvedValue("jwt-2");
		const desc = Object.getOwnPropertyDescriptor(document, "visibilityState");
		try {
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				value: "visible",
			});
			document.dispatchEvent(new Event("visibilitychange"));
		} finally {
			if (desc) {
				Object.defineProperty(document, "visibilityState", desc);
			} else {
				delete (document as { visibilityState?: string }).visibilityState;
			}
		}

		await waitFor(() => {
			expect(
				vi.mocked(tokenCache.getToken).mock.calls.length,
			).toBeGreaterThanOrEqual(2);
		});
	});

	it("runs interval refetch every 10 minutes", async () => {
		vi.useFakeTimers();
		vi.mocked(tokenCache.getToken).mockResolvedValue("jwt");

		renderHook(() => useJwt());

		await vi.waitFor(() => {
			expect(tokenCache.getToken).toHaveBeenCalled();
		});

		const getTokenMock = vi.mocked(tokenCache.getToken);
		const callsAfterMount = getTokenMock.mock.calls.length;
		await act(async () => {
			vi.advanceTimersByTime(10 * 60 * 1000);
		});

		expect(getTokenMock.mock.calls.length).toBeGreaterThan(callsAfterMount);
	});

	it("clears interval and visibility listener on unmount", async () => {
		const removeSpy = vi.spyOn(document, "removeEventListener");
		const clearSpy = vi.spyOn(globalThis, "clearInterval");

		const { unmount } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(tokenCache.getToken).toHaveBeenCalled();
		});

		unmount();

		expect(removeSpy).toHaveBeenCalledWith(
			"visibilitychange",
			expect.any(Function),
		);
		expect(clearSpy).toHaveBeenCalled();

		removeSpy.mockRestore();
		clearSpy.mockRestore();
	});
});
