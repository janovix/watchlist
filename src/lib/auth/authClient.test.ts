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
import {
	authClient,
	getClientJwt,
	AUTH_RATE_LIMIT_EVENT,
	type RateLimitEventDetail,
} from "./authClient";
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
			fetchOptions: { credentials: string; onError: unknown };
		};
		expect(client.baseURL).toBe("https://auth.example.com");
		expect(client.fetchOptions.credentials).toBe("include");
		expect(client.fetchOptions.onError).toBeTypeOf("function");
		// Note: getAuthCoreBaseUrl is called at module load time, so it may not be tracked
		// by the mock. We verify the result instead.
	});

	describe("fetchOptions.onError (429 rate limit)", () => {
		const getOnError = () => {
			const client = authClient as unknown as {
				fetchOptions: { onError: (ctx: unknown) => Promise<void> };
			};
			return client.fetchOptions.onError;
		};

		const makeResponse = (opts: {
			status: number;
			retryAfterHeader?: string | null;
			url?: string;
		}) => ({
			status: opts.status,
			headers: {
				get: (name: string) =>
					name === "X-Retry-After" ? (opts.retryAfterHeader ?? null) : null,
			},
			url: opts.url ?? "https://auth.example.com/api/foo",
		});

		it("dispatches AUTH_RATE_LIMIT_EVENT when 429 with valid X-Retry-After", async () => {
			const dispatchSpy = vi.spyOn(window, "dispatchEvent");
			const onError = getOnError();
			await onError({
				response: makeResponse({ status: 429, retryAfterHeader: "12" }),
			});
			expect(dispatchSpy).toHaveBeenCalled();
			const evt = dispatchSpy.mock
				.calls[0][0] as unknown as CustomEvent<RateLimitEventDetail>;
			expect(evt.type).toBe(AUTH_RATE_LIMIT_EVENT);
			expect(evt.detail).toEqual({
				retryAfter: 12,
				url: "https://auth.example.com/api/foo",
			});
			dispatchSpy.mockRestore();
		});

		it("does nothing when 429 but X-Retry-After header missing", async () => {
			const dispatchSpy = vi.spyOn(window, "dispatchEvent");
			const onError = getOnError();
			await onError({
				response: makeResponse({ status: 429, retryAfterHeader: null }),
			});
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});

		it("does nothing when 429 but X-Retry-After is NaN", async () => {
			const dispatchSpy = vi.spyOn(window, "dispatchEvent");
			const onError = getOnError();
			await onError({
				response: makeResponse({ status: 429, retryAfterHeader: "nope" }),
			});
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});

		it("does nothing when 429 but X-Retry-After is zero or negative", async () => {
			const dispatchSpy = vi.spyOn(window, "dispatchEvent");
			const onError = getOnError();
			await onError({
				response: makeResponse({ status: 429, retryAfterHeader: "0" }),
			});
			expect(dispatchSpy).not.toHaveBeenCalled();
			await onError({
				response: makeResponse({ status: 429, retryAfterHeader: "-1" }),
			});
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});

		it("does nothing for non-429 responses", async () => {
			const dispatchSpy = vi.spyOn(window, "dispatchEvent");
			const onError = getOnError();
			await onError({
				response: makeResponse({ status: 500, retryAfterHeader: "10" }),
			});
			expect(dispatchSpy).not.toHaveBeenCalled();
			dispatchSpy.mockRestore();
		});

		it("does not throw when window is undefined (SSR)", async () => {
			const original = globalThis.window;
			try {
				// @ts-expect-error — simulate non-browser environment
				delete globalThis.window;
				const onError = getOnError();
				await expect(
					onError({
						response: makeResponse({ status: 429, retryAfterHeader: "5" }),
					}),
				).resolves.toBeUndefined();
			} finally {
				globalThis.window = original;
			}
		});
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
			expect(console.error).toHaveBeenCalledWith(
				"Failed to get JWT:",
				"No token in response",
			);
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
			expect(console.error).toHaveBeenCalledWith(
				"Failed to get JWT:",
				"No token in response",
			);
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
