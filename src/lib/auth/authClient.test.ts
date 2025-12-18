import { describe, expect, it, vi } from "vitest";

// Mock the better-auth/client module
vi.mock("better-auth/client", () => ({
	createAuthClient: vi.fn((config) => ({
		baseURL: config.baseURL,
		fetchOptions: config.fetchOptions,
	})),
}));

vi.mock("./authCoreConfig", () => ({
	getAuthBaseURL: vi.fn(() => "https://auth.example.com"),
}));

import { createAuthClient } from "better-auth/client";
import { authClient } from "./authClient";
import { getAuthBaseURL } from "./authCoreConfig";

describe("authClient", () => {
	it("should create auth client with correct configuration", () => {
		expect(createAuthClient).toHaveBeenCalledWith({
			baseURL: "https://auth.example.com",
			fetchOptions: {
				credentials: "include",
			},
		});
		expect(getAuthBaseURL).toHaveBeenCalled();
		// Verify authClient is defined (it's the result of createAuthClient)
		expect(authClient).toBeDefined();
	});
});
