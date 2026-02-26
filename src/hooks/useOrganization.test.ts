import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/auth/config", () => ({
	getAuthCoreBaseUrl: () => "https://auth-svc.test",
}));

function orgListResponse(
	orgs: Array<{
		id?: string;
		name: string;
		logo?: string | null;
		role?: string;
	}>,
) {
	return {
		ok: true,
		json: () => Promise.resolve({ success: true, data: orgs }),
	};
}

describe("useOrganization", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it("should start with isLoading true and org null", async () => {
		mockFetch.mockResolvedValue(
			orgListResponse([{ name: "Acme Corp", logo: null }]),
		);

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.org).toBe(null);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("should set org from the first organization in the list", async () => {
		mockFetch.mockResolvedValue(
			orgListResponse([
				{
					name: "Acme Corp",
					logo: "https://cdn.example.com/logo.png",
					role: "owner",
				},
			]),
		);

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toEqual({
			name: "Acme Corp",
			logo: "https://cdn.example.com/logo.png",
			role: "owner",
		});
	});

	it("should set logo to null when org has no logo", async () => {
		mockFetch.mockResolvedValue(orgListResponse([{ name: "No Logo Inc" }]));

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toMatchObject({
			name: "No Logo Inc",
			logo: null,
		});
	});

	it("should remain org null and set isLoading false when org list is empty", async () => {
		mockFetch.mockResolvedValue(orgListResponse([]));

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toBe(null);
	});

	it("should remain org null and set isLoading false when response is not ok", async () => {
		mockFetch.mockResolvedValue({
			ok: false,
			json: () => Promise.resolve(null),
		});

		const { useOrganization } = await import("./useOrganization");
		const { result } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.org).toBe(null);
	});

	it("should handle errors gracefully and set isLoading false", async () => {
		mockFetch.mockRejectedValue(new Error("Network error"));
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

	it("should use cached org and not call fetch again on second render", async () => {
		mockFetch.mockResolvedValue(
			orgListResponse([{ name: "Cached Corp", logo: null, role: "member" }]),
		);

		const { useOrganization } = await import("./useOrganization");
		const { result: r1 } = renderHook(() => useOrganization());

		await waitFor(() => {
			expect(r1.current.isLoading).toBe(false);
		});

		expect(mockFetch).toHaveBeenCalledOnce();

		// Second render — should use cache
		const { result: r2 } = renderHook(() => useOrganization());
		expect(r2.current.isLoading).toBe(false);
		expect(r2.current.org).toMatchObject({ name: "Cached Corp", logo: null });
		// fetch should NOT have been called again
		expect(mockFetch).toHaveBeenCalledOnce();
	});
});
