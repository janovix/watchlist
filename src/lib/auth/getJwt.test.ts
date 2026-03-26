import { describe, expect, it, vi, beforeEach } from "vitest";
import { getJwt } from "./getJwt";

vi.mock("./serverAuthClient", () => ({
	serverAuthClient: {
		token: vi.fn(),
	},
}));

// Import after mock so we get the mocked version
import { serverAuthClient } from "./serverAuthClient";

describe("getJwt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return token when serverAuthClient.token() succeeds", async () => {
		vi.mocked(serverAuthClient.token).mockResolvedValue({
			data: { token: "jwt-token-123" },
			error: null,
		} as any);

		const result = await getJwt();

		expect(result).toBe("jwt-token-123");
	});

	it("should return null when response has no token data", async () => {
		vi.mocked(serverAuthClient.token).mockResolvedValue({
			data: null,
			error: null,
		} as any);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await getJwt();

		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("should return null and log error when response contains an error", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		vi.mocked(serverAuthClient.token).mockResolvedValue({
			data: null,
			error: new Error("Unauthorized"),
		} as any);

		const result = await getJwt();

		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("should return null and log error when serverAuthClient.token() throws", async () => {
		const mockError = new Error("Network error");
		vi.mocked(serverAuthClient.token).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await getJwt();

		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(
			"[getJwt] Error fetching JWT:",
			mockError,
		);

		consoleSpy.mockRestore();
	});
});
