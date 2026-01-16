import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock the better-auth/client module
vi.mock("better-auth/client", () => {
	const mockToken = vi.fn();
	const mockCreateAuthClient = vi.fn((config) => ({
		baseURL: config.baseURL,
		fetchOptions: config.fetchOptions,
		token: mockToken,
	}));
	return {
		createAuthClient: mockCreateAuthClient,
		jwtClient: vi.fn(() => ({ id: "better-auth-client" })),
		__mockToken: mockToken, // Export for testing
	};
});

vi.mock("./config", () => ({
	getAuthCoreBaseUrl: vi.fn(() => "https://auth.example.com"),
	getAuthAppUrl: vi.fn(() => "https://app.example.com"),
}));

import { createAuthClient } from "better-auth/client";
import { authClient, getClientJwt } from "./authClient";
import { getAuthCoreBaseUrl } from "./config";

// Get the mocked token function from authClient
const getMockToken = () =>
	(authClient as unknown as { token: ReturnType<typeof vi.fn> }).token;

describe("authClient", () => {
	const originalConsoleError = console.error;

	beforeEach(() => {
		vi.clearAllMocks();
		console.error = vi.fn();
	});

	afterEach(() => {
		console.error = originalConsoleError;
		vi.restoreAllMocks();
	});

	it("should create auth client with correct configuration", () => {
		// createAuthClient is called at module load time
		// Verify authClient is defined and has correct configuration
		expect(authClient).toBeDefined();
		// Type assertion needed because mock returns simplified structure
		const client = authClient as unknown as {
			baseURL: string;
			fetchOptions: { credentials: string };
		};
		expect(client.baseURL).toBe("https://auth.example.com");
		expect(client.fetchOptions).toEqual({ credentials: "include" });
		// Note: getAuthCoreBaseUrl is called at module load time, so it may not be tracked
		// by the mock. We verify the result instead.
	});

	describe("getClientJwt", () => {
		it("should return JWT token when available", async () => {
			const mockTokenValue = "test-jwt-token";
			const mockToken = getMockToken();
			vi.mocked(mockToken).mockResolvedValue({
				error: null,
				data: { token: mockTokenValue },
			});

			const result = await getClientJwt();

			expect(mockToken).toHaveBeenCalled();
			expect(result).toBe(mockTokenValue);
			expect(console.error).not.toHaveBeenCalled();
		});

		it("should return null when token has error", async () => {
			const mockToken = getMockToken();
			vi.mocked(mockToken).mockResolvedValue({
				error: { message: "Not authenticated" },
				data: null,
			});

			const result = await getClientJwt();

			expect(mockToken).toHaveBeenCalled();
			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith("Failed to get JWT:", {
				message: "Not authenticated",
			});
		});

		it("should return null when token data is missing", async () => {
			const mockToken = getMockToken();
			vi.mocked(mockToken).mockResolvedValue({
				error: null,
				data: null,
			});

			const result = await getClientJwt();

			expect(mockToken).toHaveBeenCalled();
			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith("Failed to get JWT:", null);
		});

		it("should return null when token data has no token property", async () => {
			const mockToken = getMockToken();
			vi.mocked(mockToken).mockResolvedValue({
				error: null,
				data: {},
			});

			const result = await getClientJwt();

			expect(mockToken).toHaveBeenCalled();
			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith("Failed to get JWT:", null);
		});

		it("should handle errors thrown by token()", async () => {
			const mockToken = getMockToken();
			const error = new Error("Network error");
			vi.mocked(mockToken).mockRejectedValue(error);

			const result = await getClientJwt();

			expect(mockToken).toHaveBeenCalled();
			expect(result).toBeNull();
			expect(console.error).toHaveBeenCalledWith("Error fetching JWT:", error);
		});
	});
});
