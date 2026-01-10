import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useJwt } from "./useJwt";
import * as authClient from "@/lib/auth/authClient";

vi.mock("@/lib/auth/authClient", () => ({
	getClientJwt: vi.fn(),
}));

describe("useJwt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch JWT on mount", async () => {
		const mockJwt = "test-jwt-token";
		vi.mocked(authClient.getClientJwt).mockResolvedValue(mockJwt);

		const { result } = renderHook(() => useJwt());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.jwt).toBe(null);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(mockJwt);
		expect(result.current.error).toBe(null);
		expect(authClient.getClientJwt).toHaveBeenCalledOnce();
	});

	it("should handle JWT fetch error", async () => {
		const mockError = new Error("Failed to fetch JWT");
		vi.mocked(authClient.getClientJwt).mockRejectedValue(mockError);

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(null);
		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.error?.message).toBe("Failed to fetch JWT");
	});

	it("should handle null JWT response", async () => {
		vi.mocked(authClient.getClientJwt).mockResolvedValue(null);

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(null);
		expect(result.current.error).toBe(null);
	});

	it("should handle non-Error rejection", async () => {
		vi.mocked(authClient.getClientJwt).mockRejectedValue("String error");

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.jwt).toBe(null);
		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.error?.message).toBe("Failed to fetch JWT");
	});

	it("should refetch JWT when refetch is called", async () => {
		const mockJwt = "test-jwt-token";
		vi.mocked(authClient.getClientJwt).mockResolvedValue(mockJwt);

		const { result } = renderHook(() => useJwt());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(authClient.getClientJwt).toHaveBeenCalledTimes(1);

		await result.current.refetch();

		expect(authClient.getClientJwt).toHaveBeenCalledTimes(2);
	});
});
