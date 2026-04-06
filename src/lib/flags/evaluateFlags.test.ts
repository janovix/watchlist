import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluateFlagsForSession } from "./evaluateFlags";

vi.mock("@/lib/auth/config", () => ({
	getFlagsServiceUrl: () => "https://flags.example.com/",
}));

vi.mock("@/lib/auth/getJwt", () => ({
	getJwt: vi.fn(),
}));

vi.mock("@/lib/auth/getServerSession", () => ({
	getServerSession: vi.fn(),
}));

import { getJwt } from "@/lib/auth/getJwt";
import { getServerSession } from "@/lib/auth/getServerSession";

describe("evaluateFlagsForSession", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.mocked(getJwt).mockReset();
		vi.mocked(getServerSession).mockReset();
		fetchMock.mockReset();
	});

	it("returns empty flags when no keys requested", async () => {
		await expect(evaluateFlagsForSession([])).resolves.toEqual({
			flags: {},
			error: null,
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns error when JWT is missing", async () => {
		vi.mocked(getJwt).mockResolvedValue(null);

		await expect(evaluateFlagsForSession(["a"])).resolves.toEqual({
			flags: {},
			error: "Not authenticated",
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns error payload when flags HTTP response is not ok", async () => {
		vi.mocked(getJwt).mockResolvedValue("jwt-token");
		vi.mocked(getServerSession).mockResolvedValue({
			user: { id: "user-1" },
			session: { activeOrganizationId: "org-1" },
		} as Awaited<ReturnType<typeof getServerSession>>);
		fetchMock.mockResolvedValue(
			new Response("{}", { status: 502, statusText: "Bad Gateway" }),
		);

		const result = await evaluateFlagsForSession(["stripe-billing-enabled"]);
		expect(result.flags).toEqual({});
		expect(result.error).toBe("Flags evaluate failed (502)");
	});

	it("includes organization and user context when calling evaluate", async () => {
		vi.mocked(getJwt).mockResolvedValue("jwt-token");
		vi.mocked(getServerSession).mockResolvedValue({
			user: { id: "user-1" },
			session: {},
		} as Awaited<ReturnType<typeof getServerSession>>);
		fetchMock.mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					result: { "stripe-billing-enabled": true },
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			),
		);

		const result = await evaluateFlagsForSession(["stripe-billing-enabled"]);
		expect(result.error).toBeNull();
		expect(result.flags).toEqual({ "stripe-billing-enabled": true });

		expect(fetchMock).toHaveBeenCalledWith(
			"https://flags.example.com/api/flags/evaluate",
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining('"userId":"user-1"'),
			}),
		);
	});

	it("uses empty flags when JSON body is missing result", async () => {
		vi.mocked(getJwt).mockResolvedValue("jwt-token");
		vi.mocked(getServerSession).mockResolvedValue({
			user: { id: "user-1" },
			session: { activeOrganizationId: "org-1" },
		} as Awaited<ReturnType<typeof getServerSession>>);
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const result = await evaluateFlagsForSession(["k"]);
		expect(result).toEqual({ flags: {}, error: null });
	});
});
