import { describe, expect, it, vi, beforeEach } from "vitest";
import { getServerSession } from "./getServerSession";

vi.mock("./serverAuthClient", () => ({
	serverAuthClient: {
		getSession: vi.fn(),
	},
}));

// Import after mock so we get the mocked version
import { serverAuthClient } from "./serverAuthClient";

describe("getServerSession", () => {
	const mockUser = {
		id: "user-1",
		name: "Test User",
		email: "test@example.com",
		image: null as string | null,
		emailVerified: true,
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-02T00:00:00.000Z",
	};

	const mockSessionData = {
		id: "session-1",
		userId: "user-1",
		token: "token-123",
		expiresAt: "2024-12-31T00:00:00.000Z",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-02T00:00:00.000Z",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return null when serverAuthClient returns no data", async () => {
		vi.mocked(serverAuthClient.getSession).mockResolvedValue({
			data: null,
			error: null,
		} as any);

		const result = await getServerSession();

		expect(result).toBeNull();
	});

	it("should return session with normalized Date fields from ISO strings", async () => {
		vi.mocked(serverAuthClient.getSession).mockResolvedValue({
			data: { user: mockUser, session: mockSessionData },
			error: null,
		} as any);

		const result = await getServerSession();

		expect(result).not.toBeNull();
		expect(result?.user.id).toBe("user-1");
		expect(result?.user.email).toBe("test@example.com");
		expect(result?.user.createdAt).toBeInstanceOf(Date);
		expect(result?.user.updatedAt).toBeInstanceOf(Date);
		expect(result?.session.id).toBe("session-1");
		expect(result?.session.token).toBe("token-123");
		expect(result?.session.expiresAt).toBeInstanceOf(Date);
		expect(result?.session.createdAt).toBeInstanceOf(Date);
		expect(result?.session.updatedAt).toBeInstanceOf(Date);
	});

	it("should handle Date objects in response (not just ISO strings)", async () => {
		vi.mocked(serverAuthClient.getSession).mockResolvedValue({
			data: {
				user: {
					...mockUser,
					createdAt: new Date("2024-01-01"),
					updatedAt: new Date("2024-01-02"),
				},
				session: {
					...mockSessionData,
					expiresAt: new Date("2024-12-31"),
					createdAt: new Date("2024-01-01"),
					updatedAt: new Date("2024-01-02"),
				},
			},
			error: null,
		} as any);

		const result = await getServerSession();

		expect(result?.user.createdAt).toBeInstanceOf(Date);
		expect(result?.user.updatedAt).toBeInstanceOf(Date);
		expect(result?.session.expiresAt).toBeInstanceOf(Date);
		expect(result?.session.createdAt).toBeInstanceOf(Date);
		expect(result?.session.updatedAt).toBeInstanceOf(Date);
	});

	it("should preserve null image field", async () => {
		vi.mocked(serverAuthClient.getSession).mockResolvedValue({
			data: {
				user: { ...mockUser, image: null },
				session: mockSessionData,
			},
			error: null,
		} as any);

		const result = await getServerSession();

		expect(result?.user.image).toBeNull();
	});

	it("should handle null ipAddress and userAgent", async () => {
		vi.mocked(serverAuthClient.getSession).mockResolvedValue({
			data: {
				user: mockUser,
				session: {
					...mockSessionData,
					ipAddress: null,
					userAgent: null,
				},
			},
			error: null,
		} as any);

		const result = await getServerSession();

		expect(result?.session.ipAddress).toBeNull();
		expect(result?.session.userAgent).toBeNull();
	});

	it("should return null and log error when getSession throws", async () => {
		const mockError = new Error("Network error");
		vi.mocked(serverAuthClient.getSession).mockRejectedValue(mockError);

		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const result = await getServerSession();

		expect(result).toBeNull();
		expect(consoleSpy).toHaveBeenCalledWith(
			"[getServerSession] Failed to fetch session:",
			mockError,
		);

		consoleSpy.mockRestore();
	});
});
