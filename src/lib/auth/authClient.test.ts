import { describe, expect, it, vi } from "vitest";

// Mock the better-auth/client module
vi.mock("better-auth/client", () => ({
	createAuthClient: vi.fn((config) => ({
		baseURL: config.baseURL,
		fetchOptions: config.fetchOptions,
	})),
}));

vi.mock("./config", () => ({
	getAuthCoreBaseUrl: vi.fn(() => "https://auth.example.com"),
	getAuthAppUrl: vi.fn(() => "https://app.example.com"),
}));

import { createAuthClient } from "better-auth/client";
import { authClient } from "./authClient";
import { getAuthCoreBaseUrl } from "./config";

describe("authClient", () => {
	it("should create auth client with correct configuration", () => {
		expect(createAuthClient).toHaveBeenCalledWith({
			baseURL: "https://auth.example.com",
			fetchOptions: {
				credentials: "include",
			},
		});
		expect(getAuthCoreBaseUrl).toHaveBeenCalled();
		// Verify authClient is defined (it's the result of createAuthClient)
		expect(authClient).toBeDefined();
	});
});
