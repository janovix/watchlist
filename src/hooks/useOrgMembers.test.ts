import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const mockOrganizationList = vi.fn();
const mockOrganizationListMembers = vi.fn();

vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		organization: {
			list: () => mockOrganizationList(),
			listMembers: (opts: unknown) => mockOrganizationListMembers(opts),
		},
	},
}));

describe("useOrgMembers", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();
		vi.mock("@/lib/auth/authClient", () => ({
			authClient: {
				organization: {
					list: () => mockOrganizationList(),
					listMembers: (opts: unknown) => mockOrganizationListMembers(opts),
				},
			},
		}));
	});

	it("should start with isLoading true and empty members", async () => {
		mockOrganizationList.mockResolvedValue({ data: [{ id: "org-1" }] });
		mockOrganizationListMembers.mockResolvedValue({ data: [] });

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result } = renderHook(() => useOrgMembers());

		expect(result.current.isLoading).toBe(true);
		expect(result.current.members).toEqual({});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});
	});

	it("should build a member map from the API response", async () => {
		mockOrganizationList.mockResolvedValue({ data: [{ id: "org-1" }] });
		mockOrganizationListMembers.mockResolvedValue({
			data: [
				{ user: { id: "user-1", name: "Alice Smith" } },
				{ user: { id: "user-2", name: "Bob Jones" } },
			],
		});

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result } = renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.members).toEqual({
			"user-1": "Alice Smith",
			"user-2": "Bob Jones",
		});
	});

	it("should call listMembers with the first org id and correct params", async () => {
		mockOrganizationList.mockResolvedValue({ data: [{ id: "org-abc" }] });
		mockOrganizationListMembers.mockResolvedValue({ data: [] });

		const { useOrgMembers } = await import("./useOrgMembers");
		renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(mockOrganizationListMembers).toHaveBeenCalledOnce();
		});

		expect(mockOrganizationListMembers).toHaveBeenCalledWith({
			query: { organizationId: "org-abc", limit: 200 },
		});
	});

	it("should set empty members map and isLoading false when org list is empty", async () => {
		mockOrganizationList.mockResolvedValue({ data: [] });

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result } = renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.members).toEqual({});
		expect(mockOrganizationListMembers).not.toHaveBeenCalled();
	});

	it("should set empty members when data is null", async () => {
		mockOrganizationList.mockResolvedValue({ data: null });

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result } = renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.members).toEqual({});
	});

	it("should skip members without user id or name", async () => {
		mockOrganizationList.mockResolvedValue({ data: [{ id: "org-1" }] });
		mockOrganizationListMembers.mockResolvedValue({
			data: [
				{ user: { id: "user-1", name: "Valid User" } },
				{ user: { id: null, name: "No ID" } },
				{ user: { id: "user-3", name: null } },
				{ user: null },
			],
		});

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result } = renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.members).toEqual({ "user-1": "Valid User" });
	});

	it("should handle errors gracefully and set isLoading false", async () => {
		mockOrganizationList.mockRejectedValue(new Error("Network error"));
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result } = renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.members).toEqual({});
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("should use cached members and not call API again on second render", async () => {
		mockOrganizationList.mockResolvedValue({ data: [{ id: "org-1" }] });
		mockOrganizationListMembers.mockResolvedValue({
			data: [{ user: { id: "user-1", name: "Cached User" } }],
		});

		const { useOrgMembers } = await import("./useOrgMembers");
		const { result: r1 } = renderHook(() => useOrgMembers());

		await waitFor(() => {
			expect(r1.current.isLoading).toBe(false);
		});

		expect(mockOrganizationList).toHaveBeenCalledOnce();

		// Second render should use cache
		const { result: r2 } = renderHook(() => useOrgMembers());
		expect(r2.current.isLoading).toBe(false);
		expect(r2.current.members).toEqual({ "user-1": "Cached User" });
		expect(mockOrganizationList).toHaveBeenCalledOnce();
	});
});
