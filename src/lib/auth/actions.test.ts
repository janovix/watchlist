import { describe, it, expect, vi, beforeEach } from "vitest";
import { logout } from "./actions";

// Mock authClient
const mockSignOut = vi.fn();
vi.mock("./authClient", () => ({
	authClient: {
		signOut: () => mockSignOut(),
	},
}));

// Mock sessionStore
const mockClearSession = vi.fn();
vi.mock("./sessionStore", () => ({
	clearSession: () => mockClearSession(),
}));

// Mock authCoreConfig
vi.mock("./authCoreConfig", () => ({
	getAuthAppUrl: vi.fn(() => "https://auth.example.com"),
}));

describe("logout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock window.location
		Object.defineProperty(window, "location", {
			value: {
				href: "",
			},
			writable: true,
		});
	});

	it("should call signOut, clear session, and redirect on success", async () => {
		mockSignOut.mockResolvedValue({ data: null, error: null });

		await logout();

		expect(mockSignOut).toHaveBeenCalled();
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com");
	});

	it("should clear session and redirect even if signOut fails", async () => {
		mockSignOut.mockRejectedValue(new Error("Network error"));

		await logout();

		expect(mockSignOut).toHaveBeenCalled();
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com");
	});

	it("should clear session and redirect even if signOut returns error", async () => {
		mockSignOut.mockResolvedValue({
			data: null,
			error: { message: "Sign out failed" },
		});

		await logout();

		expect(mockSignOut).toHaveBeenCalled();
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com");
	});
});
