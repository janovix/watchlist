import { describe, it, expect, vi, beforeEach } from "vitest";
import { logout } from "./actions";

// Mock sessionStore
const mockClearSession = vi.fn();
vi.mock("./sessionStore", () => ({
	clearSession: () => mockClearSession(),
}));

// Mock authClient - capture options and invoke onSuccess callback
const mockSignOut = vi.fn();
vi.mock("./authClient", () => ({
	authClient: {
		signOut: (options?: { fetchOptions?: { onSuccess?: () => void } }) => {
			return mockSignOut(options).then(() => {
				options?.fetchOptions?.onSuccess?.();
			});
		},
	},
}));

// Mock config
const mockGetAuthAppUrl = vi.fn(() => "https://auth.example.com");
vi.mock("./config", () => ({
	getAuthAppUrl: () => mockGetAuthAppUrl(),
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

	it("should call authClient.signOut with onSuccess, clear session, and redirect", async () => {
		mockSignOut.mockResolvedValue(undefined);

		await logout();

		expect(mockSignOut).toHaveBeenCalledWith(
			expect.objectContaining({
				fetchOptions: expect.objectContaining({
					onSuccess: expect.any(Function),
				}),
			}),
		);
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com/login");
	});

	it("should clear session and redirect even if signOut fails", async () => {
		mockSignOut.mockRejectedValue(new Error("Network error"));

		await logout();

		expect(mockSignOut).toHaveBeenCalled();
		expect(mockClearSession).toHaveBeenCalled();
		expect(window.location.href).toBe("https://auth.example.com/login");
	});
});
