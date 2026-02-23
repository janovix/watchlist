import { describe, expect, it, vi, beforeEach } from "vitest";
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
});
