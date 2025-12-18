import { describe, it, expect, vi, beforeEach } from "vitest";
import { logout } from "./actions";

// Mock sessionStore
const mockClearSession = vi.fn();
vi.mock("./sessionStore", () => ({
	clearSession: () => mockClearSession(),
}));

// Mock config
const mockGetAuthAppUrl = vi.fn(() => "https://auth.example.com");
const mockGetAuthCoreBaseUrl = vi.fn(() => "https://auth-svc.example.com");
vi.mock("./config", () => ({
	getAuthAppUrl: () => mockGetAuthAppUrl(),
	getAuthCoreBaseUrl: () => mockGetAuthCoreBaseUrl(),
}));

describe("logout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
		// Mock window.location
		Object.defineProperty(window, "location", {
			value: {
				href: "",
			},
			writable: true,
		});
	});

	it("should call sign-out API with redirect manual, clear session, and redirect", async () => {
		vi.mocked(global.fetch).mockResolvedValue({
			ok: true,
			status: 200,
		} as Response);

		await logout();

		expect(global.fetch).toHaveBeenCalledWith(
			"https://auth-svc.example.com/api/auth/sign-out",
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				redirect: "manual",
			}),
		);
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com/login");
	});

	it("should clear session and redirect even if sign-out API fails", async () => {
		vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

		await logout();

		expect(global.fetch).toHaveBeenCalled();
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com/login");
	});
});
