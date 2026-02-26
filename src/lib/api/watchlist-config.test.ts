import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWatchlistConfig } from "./watchlist-config";

const DEFAULT_FEATURES = {
	pepSearch: true,
	pepGrok: true,
	adverseMedia: true,
};

describe("fetchWatchlistConfig", () => {
	const originalEnv = process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL;

	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL;
	});

	afterEach(() => {
		process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL = originalEnv;
	});

	it("should return features from a successful API response", async () => {
		const mockFeatures = {
			pepSearch: true,
			pepGrok: false,
			adverseMedia: true,
		};
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				success: true,
				result: { features: mockFeatures },
			}),
		});

		const result = await fetchWatchlistConfig();

		expect(result).toEqual(mockFeatures);
		expect(global.fetch).toHaveBeenCalledWith(
			"https://watchlist-svc.janovix.workers.dev/config",
		);
	});

	it("should use NEXT_PUBLIC_WATCHLIST_API_BASE_URL when set", async () => {
		process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL =
			"https://custom.watchlist.dev";
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				success: true,
				result: { features: DEFAULT_FEATURES },
			}),
		});

		await fetchWatchlistConfig();

		expect(global.fetch).toHaveBeenCalledWith(
			"https://custom.watchlist.dev/config",
		);
	});

	it("should return default features when API returns non-200 status", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
		});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const result = await fetchWatchlistConfig();

		expect(result).toEqual(DEFAULT_FEATURES);
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("500"));
		warnSpy.mockRestore();
	});

	it("should return default features when fetch throws a network error", async () => {
		global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const result = await fetchWatchlistConfig();

		expect(result).toEqual(DEFAULT_FEATURES);
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});

	it("should return default features when JSON parsing fails", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
		});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const result = await fetchWatchlistConfig();

		expect(result).toEqual(DEFAULT_FEATURES);
		warnSpy.mockRestore();
	});
});
