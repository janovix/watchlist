import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	listQueries,
	getQuery,
	type ListQueriesParams,
	type ListQueriesResponse,
	type GetQueryResponse,
	type QueryListItem,
	type SearchQuery,
} from "./queries";
import * as httpModule from "./http";

// Mock the http module
vi.mock("./http", () => ({
	fetchJson: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		body: unknown;
		constructor(message: string, details: { status: number; body: unknown }) {
			super(message);
			this.status = details.status;
			this.body = details.body;
		}
	},
}));

describe("queries API", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("listQueries", () => {
		it("calls GET /queries with correct URL", async () => {
			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await listQueries();

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/queries"),
				expect.objectContaining({
					method: "GET",
				}),
			);
		});

		it("includes JWT in request when provided", async () => {
			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await listQueries(undefined, { jwt: "test-jwt-token" });

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: "GET",
					jwt: "test-jwt-token",
				}),
			);
		});

		it("passes pagination params as query string", async () => {
			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 2,
					pageSize: 10,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const params: ListQueriesParams = {
				page: 2,
				pageSize: 10,
			};

			await listQueries(params);

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("page=2"),
				expect.any(Object),
			);
			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("pageSize=10"),
				expect.any(Object),
			);
		});

		it("passes status filter as query string", async () => {
			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const params: ListQueriesParams = {
				status: "completed",
			};

			await listQueries(params);

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("status=completed"),
				expect.any(Object),
			);
		});

		it("returns list of queries on success", async () => {
			const mockQueries: QueryListItem[] = [
				{
					id: "query-1",
					organizationId: "org-1",
					userId: "user-1",
					query: "John Doe",
					entityType: "person",
					birthDate: null,
					countries: null,
					status: "completed",
					ofacStatus: "completed",
					ofacCount: 2,
					sat69bStatus: "completed",
					sat69bCount: 0,
					unStatus: "completed",
					unCount: 1,
					pepOfficialStatus: "completed",
					pepOfficialCount: 0,
					pepAiStatus: null,
					adverseMediaStatus: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:01:00Z",
				},
			];

			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: mockQueries,
					total: 1,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const result = await listQueries();

			expect(result.success).toBe(true);
			expect(result.result.queries).toHaveLength(1);
			expect(result.result.queries[0].id).toBe("query-1");
			expect(result.result.total).toBe(1);
		});

		it("throws ApiError on non-success response", async () => {
			const mockResponse = {
				success: false,
				error: "Unauthorized",
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 401,
			});

			await expect(listQueries()).rejects.toThrow("Failed to list queries");
		});

		it("handles empty query params", async () => {
			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await listQueries({});

			const callUrl = vi.mocked(httpModule.fetchJson).mock.calls[0][0];
			// Should not have any query params (or just empty string after ?)
			expect(callUrl).toMatch(/\/queries\??$/);
		});
	});

	describe("getQuery", () => {
		it("calls GET /queries/:id with correct URL", async () => {
			const mockQuery: SearchQuery = {
				id: "query-123",
				organizationId: "org-1",
				userId: "user-1",
				query: "Jane Smith",
				entityType: "person",
				birthDate: "1990-01-01",
				countries: ["US"],
				status: "completed",
				ofacStatus: "completed",
				ofacResult: { matches: [], count: 0 },
				ofacCount: 0,
				sat69bStatus: "completed",
				sat69bResult: { matches: [], count: 0 },
				sat69bCount: 0,
				unStatus: "completed",
				unResult: { matches: [], count: 0 },
				unCount: 0,
				pepOfficialStatus: "completed",
				pepOfficialResult: null,
				pepOfficialCount: 0,
				pepAiStatus: null,
				pepAiResult: null,
				adverseMediaStatus: null,
				adverseMediaResult: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:01:00Z",
			};

			const mockResponse: GetQueryResponse = {
				success: true,
				result: mockQuery,
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await getQuery("query-123");

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.stringContaining("/queries/query-123"),
				expect.objectContaining({
					method: "GET",
				}),
			);
		});

		it("includes JWT in request when provided", async () => {
			const mockQuery: SearchQuery = {
				id: "query-123",
				organizationId: "org-1",
				userId: "user-1",
				query: "Jane Smith",
				entityType: "person",
				birthDate: null,
				countries: null,
				status: "completed",
				ofacStatus: "completed",
				ofacResult: { matches: [], count: 0 },
				ofacCount: 0,
				sat69bStatus: "completed",
				sat69bResult: { matches: [], count: 0 },
				sat69bCount: 0,
				unStatus: "completed",
				unResult: { matches: [], count: 0 },
				unCount: 0,
				pepOfficialStatus: "completed",
				pepOfficialResult: null,
				pepOfficialCount: 0,
				pepAiStatus: null,
				pepAiResult: null,
				adverseMediaStatus: null,
				adverseMediaResult: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:01:00Z",
			};

			const mockResponse: GetQueryResponse = {
				success: true,
				result: mockQuery,
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await getQuery("query-123", { jwt: "test-jwt-token" });

			expect(httpModule.fetchJson).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: "GET",
					jwt: "test-jwt-token",
				}),
			);
		});

		it("returns query details on success", async () => {
			const mockQuery: SearchQuery = {
				id: "query-456",
				organizationId: "org-1",
				userId: "user-1",
				query: "ACME Corp",
				entityType: "organization",
				birthDate: null,
				countries: ["MX", "US"],
				status: "completed",
				ofacStatus: "completed",
				ofacResult: {
					matches: [
						{
							target: {
								id: "ofac-1",
								partyType: "Entity",
								primaryName: "ACME CORP",
								aliases: null,
								birthDate: null,
								birthPlace: null,
								addresses: null,
								identifiers: null,
								remarks: null,
								sourceList: "SDNT",
								createdAt: "2024-01-01T00:00:00Z",
								updatedAt: "2024-01-01T00:00:00Z",
							},
							score: 0.95,
							breakdown: {
								vectorScore: 0.9,
								nameScore: 0.95,
								metaScore: 0.0,
								identifierMatch: false,
							},
						},
					],
					count: 1,
				},
				ofacCount: 1,
				sat69bStatus: "completed",
				sat69bResult: { matches: [], count: 0 },
				sat69bCount: 0,
				unStatus: "completed",
				unResult: { matches: [], count: 0 },
				unCount: 0,
				pepOfficialStatus: "completed",
				pepOfficialResult: null,
				pepOfficialCount: 0,
				pepAiStatus: null,
				pepAiResult: null,
				adverseMediaStatus: null,
				adverseMediaResult: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:01:00Z",
			};

			const mockResponse: GetQueryResponse = {
				success: true,
				result: mockQuery,
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const result = await getQuery("query-456");

			expect(result.success).toBe(true);
			expect(result.result.id).toBe("query-456");
			expect(result.result.query).toBe("ACME Corp");
			expect(result.result.ofacCount).toBe(1);
			expect(result.result.ofacResult?.matches).toHaveLength(1);
		});

		it("throws ApiError on non-success response", async () => {
			const mockResponse = {
				success: false,
				error: "Query not found",
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 404,
			});

			await expect(getQuery("nonexistent-query")).rejects.toThrow(
				"Failed to get query",
			);
		});

		it("handles query with all null optional fields", async () => {
			const mockQuery: SearchQuery = {
				id: "query-789",
				organizationId: "org-1",
				userId: null,
				query: "Test Query",
				entityType: null,
				birthDate: null,
				countries: null,
				status: "pending",
				ofacStatus: null,
				ofacResult: null,
				ofacCount: null,
				sat69bStatus: null,
				sat69bResult: null,
				sat69bCount: null,
				unStatus: null,
				unResult: null,
				unCount: null,
				pepOfficialStatus: null,
				pepOfficialResult: null,
				pepOfficialCount: null,
				pepAiStatus: null,
				pepAiResult: null,
				adverseMediaStatus: null,
				adverseMediaResult: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			const mockResponse: GetQueryResponse = {
				success: true,
				result: mockQuery,
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			const result = await getQuery("query-789");

			expect(result.success).toBe(true);
			expect(result.result.id).toBe("query-789");
			expect(result.result.userId).toBeNull();
			expect(result.result.ofacStatus).toBeNull();
		});
	});

	describe("API Base URL resolution", () => {
		it("should use NEXT_PUBLIC_WATCHLIST_API_BASE_URL when available", async () => {
			const originalEnv = process.env;
			process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL =
				"https://custom-watchlist.example.com";

			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await listQueries();

			const callArgs = vi.mocked(httpModule.fetchJson).mock.calls[0];
			expect(callArgs[0]).toContain("custom-watchlist.example.com");

			process.env = originalEnv;
		});

		it("should fall back to default URL when env var not set", async () => {
			const originalEnv = process.env;
			delete process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL;
			delete process.env.WATCHLIST_API_BASE_URL_INTERNAL;
			delete process.env.WATCHLIST_API_BASE_URL;

			const mockResponse: ListQueriesResponse = {
				success: true,
				result: {
					queries: [],
					total: 0,
					page: 1,
					pageSize: 20,
					hasMore: false,
				},
			};

			vi.mocked(httpModule.fetchJson).mockResolvedValue({
				json: mockResponse,
				status: 200,
			});

			await listQueries();

			const callArgs = vi.mocked(httpModule.fetchJson).mock.calls[0];
			expect(callArgs[0]).toContain("watchlist-svc.janovix.workers.dev");

			process.env = originalEnv;
		});
	});
});
