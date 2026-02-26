import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("./authClient", () => ({
	getClientJwt: vi.fn(),
}));

import { getClientJwt } from "./authClient";
import { tokenCache } from "./tokenCache";

describe("tokenCache", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		tokenCache.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should fetch and cache a token", async () => {
		vi.mocked(getClientJwt).mockResolvedValue("token-1");

		const t1 = await tokenCache.getToken();
		const t2 = await tokenCache.getToken();

		expect(t1).toBe("token-1");
		expect(t2).toBe("token-1");
		expect(getClientJwt).toHaveBeenCalledTimes(1);
	});

	it("should deduplicate concurrent requests", async () => {
		let resolveToken!: (v: string) => void;
		vi.mocked(getClientJwt).mockImplementation(
			() => new Promise((r) => (resolveToken = r)),
		);

		const p1 = tokenCache.getToken();
		const p2 = tokenCache.getToken();
		const p3 = tokenCache.getToken();

		resolveToken("deduped-token");

		const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

		expect(r1).toBe("deduped-token");
		expect(r2).toBe("deduped-token");
		expect(r3).toBe("deduped-token");
		expect(getClientJwt).toHaveBeenCalledTimes(1);
	});

	it("should bypass cache on forceRefresh", async () => {
		vi.mocked(getClientJwt)
			.mockResolvedValueOnce("old-token")
			.mockResolvedValueOnce("new-token");

		const t1 = await tokenCache.getToken();
		const t2 = await tokenCache.getToken(true);

		expect(t1).toBe("old-token");
		expect(t2).toBe("new-token");
		expect(getClientJwt).toHaveBeenCalledTimes(2);
	});

	it("should re-fetch after cache is cleared", async () => {
		vi.mocked(getClientJwt)
			.mockResolvedValueOnce("token-a")
			.mockResolvedValueOnce("token-b");

		await tokenCache.getToken();
		tokenCache.clear();
		const t2 = await tokenCache.getToken();

		expect(t2).toBe("token-b");
		expect(getClientJwt).toHaveBeenCalledTimes(2);
	});

	it("should clear cache when getClientJwt returns null", async () => {
		vi.mocked(getClientJwt).mockResolvedValue(null);

		const token = await tokenCache.getToken();

		expect(token).toBeNull();

		vi.mocked(getClientJwt).mockResolvedValue("recovered");
		const t2 = await tokenCache.getToken();
		expect(t2).toBe("recovered");
		expect(getClientJwt).toHaveBeenCalledTimes(2);
	});

	it("should clear cache and re-throw on fetch error", async () => {
		vi.mocked(getClientJwt).mockRejectedValue(new Error("network"));

		await expect(tokenCache.getToken()).rejects.toThrow("network");

		vi.mocked(getClientJwt).mockResolvedValue("after-error");
		const t = await tokenCache.getToken();
		expect(t).toBe("after-error");
	});

	it("should re-fetch after stale timeout", async () => {
		vi.useFakeTimers();

		vi.mocked(getClientJwt)
			.mockResolvedValueOnce("fresh")
			.mockResolvedValueOnce("refreshed");

		await tokenCache.getToken();

		vi.advanceTimersByTime(5 * 60 * 1000 + 1);

		const t2 = await tokenCache.getToken();
		expect(t2).toBe("refreshed");
		expect(getClientJwt).toHaveBeenCalledTimes(2);

		vi.useRealTimers();
	});
});
