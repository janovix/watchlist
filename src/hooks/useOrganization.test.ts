import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockOrganizationList = vi.fn();

vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		organization: {
			list: () => mockOrganizationList(),
		},
	},
}));

describe("useOrganization", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();
		vi.mock("@/lib/auth/authClient", () => ({
			authClient: {
				organization: {
					list: () => mockOrganizationList(),
				},
			},
		}));
	});

	it("should start with isLoading true and org null", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [{ name: "Acme Corp", logo: null }],
		});

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.org).toBe(null);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("should set org from the first organization in the list", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [{ name: "Acme Corp", logo: "https://cdn.example.com/logo.png" }],
		});

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toEqual({
			name: "Acme Corp",
			logo: "https://cdn.example.com/logo.png",
		});
	});

	it("should set logo to null when org has no logo", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [{ name: "No Logo Inc", logo: undefined }],
		});

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toEqual({ name: "No Logo Inc", logo: null });
	});

	it("should remain org null and set isLoading false when org list is empty", async () => {
		mockOrganizationList.mockResolvedValue({ data: [] });

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toBe(null);
	});

	it("should remain org null and set isLoading false when data is null", async () => {
		mockOrganizationList.mockResolvedValue({ data: null });

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toBe(null);
	});

	it("should handle errors gracefully and set isLoading false", async () => {
		mockOrganizationList.mockRejectedValue(new Error("Network error"));
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toBe(null);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("should use cached org and not call list again on second render", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [{ name: "Cached Corp", logo: null }],
		});

		const { useOrganization } = await import("./useOrganization");
		const { result: r1 } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(r1.current.isLoading).toBe(false);
		});

		expect(mockOrganizationList).toHaveBeenCalledOnce();

		// Second render — should use cache
		const { result: r2 } = renderHook(() => useOrganization());
		expect(r2.current.isLoading).toBe(false);
		expect(r2.current.org).toEqual({ name: "Cached Corp", logo: null });
		// list should NOT have been called again
		expect(mockOrganizationList).toHaveBeenCalledOnce();
	});
});
