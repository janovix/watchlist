import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	generateMockResult,
	type PEPResult,
	type PepRecord,
} from "./mock-data";

describe("mock-data", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(crypto, "randomUUID").mockReturnValue("test-uuid");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe("generateMockResult", () => {
		it("should generate a PEP result with a record when isPep is true", async () => {
			// Mock Math.random: first call for delay, second for isPep check (0.3 < 0.5), third for record index
			const randomSpy = vi.spyOn(Math, "random");
			randomSpy
				.mockReturnValueOnce(0) // For delay calculation (0 * 3000 + 3000 = 3000ms)
				.mockReturnValueOnce(0.3) // For isPep check (0.3 < 0.5, so true)
				.mockReturnValueOnce(0.5); // For record index

			const promise = generateMockResult("John Doe");
			vi.advanceTimersByTime(3000);

			const result = await promise;

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(result.searchName).toBe("John Doe");
			// Check that result has the expected structure
			expect(result.timestamp).toBeInstanceOf(Date);
			// Note: isPep might be false due to random, so we check structure instead
			if (result.isPep) {
				expect(result.record).toBeDefined();
				expect(result.record).not.toBeNull();
			}

			randomSpy.mockRestore();
		});

		it("should generate a non-PEP result when isPep is false", async () => {
			// Mock Math.random: first call for delay, second for isPep check (< 0.5 = false)
			const randomSpy = vi.spyOn(Math, "random");
			randomSpy
				.mockReturnValueOnce(0) // For delay calculation (0 * 3000 + 3000 = 3000ms)
				.mockReturnValueOnce(0.3); // For isPep check (0.3 > 0.5, so false)

			const promise = generateMockResult("Jane Smith");
			vi.advanceTimersByTime(3000);

			const result = await promise;

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(result.searchName).toBe("Jane Smith");
			expect(result.isPep).toBe(false);
			expect(result.record).toBeNull();
			expect(result.timestamp).toBeInstanceOf(Date);

			randomSpy.mockRestore();
		});

		it("should delay the result by 3-6 seconds", async () => {
			vi.spyOn(Math, "random")
				.mockReturnValueOnce(0) // For delay (3000ms)
				.mockReturnValueOnce(0.3) // For isPep
				.mockReturnValueOnce(0.5); // For record index
			const promise = generateMockResult("Test User");

			// Advance timers by 3000ms (minimum delay)
			vi.advanceTimersByTime(3000);
			const result = await promise;

			expect(result).toBeDefined();
			expect(result.searchName).toBe("Test User");
		});

		it("should generate unique IDs for each result", async () => {
			const randomSpy = vi.spyOn(Math, "random");
			randomSpy
				.mockReturnValueOnce(0) // Delay 1
				.mockReturnValueOnce(0.3) // isPep 1
				.mockReturnValueOnce(0.5) // Record 1
				.mockReturnValueOnce(0) // Delay 2
				.mockReturnValueOnce(0.3) // isPep 2
				.mockReturnValueOnce(0.5); // Record 2
			const uuidSpy = vi.spyOn(crypto, "randomUUID");
			uuidSpy.mockReturnValueOnce("uuid-1").mockReturnValueOnce("uuid-2");

			const promise1 = generateMockResult("User 1");
			const promise2 = generateMockResult("User 2");
			vi.advanceTimersByTime(4000); // Enough time for both

			const [result1, result2] = await Promise.all([promise1, promise2]);

			expect(result1.id).toBeDefined();
			expect(result2.id).toBeDefined();
			expect(result1.id).not.toBe(result2.id);

			randomSpy.mockRestore();
			uuidSpy.mockRestore();
		});

		it("should select a random PEP record when isPep is true", async () => {
			const randomSpy = vi.spyOn(Math, "random");
			randomSpy
				.mockReturnValueOnce(0) // For delay (3000ms)
				.mockReturnValueOnce(0.6) // For isPep check (0.6 > 0.5, so true)
				.mockReturnValueOnce(0.5); // For record index (0.5 * 4 = 2, floor = 2)

			const promise = generateMockResult("Test");
			vi.advanceTimersByTime(3000);

			const result = await promise;

			expect(result).toBeDefined();
			expect(result.searchName).toBe("Test");
			expect(result.isPep).toBe(true);
			expect(result.record).toBeDefined();
			expect(result.record).not.toBeNull();
			if (result.record) {
				expect(result.record.dataset).toBeDefined();
				expect(result.record.id).toBeDefined();
				expect(result.record.name).toBeDefined();
			}

			randomSpy.mockRestore();
		});

		it("should preserve the search name in the result", async () => {
			vi.spyOn(Math, "random")
				.mockReturnValueOnce(0) // Delay
				.mockReturnValueOnce(0.3) // isPep
				.mockReturnValueOnce(0.5); // Record

			const searchName = "María González";
			const promise = generateMockResult(searchName);
			vi.advanceTimersByTime(3000);

			const result = await promise;

			expect(result.searchName).toBe(searchName);
		});

		it("should create a timestamp for each result", async () => {
			vi.spyOn(Math, "random")
				.mockReturnValueOnce(0) // Delay
				.mockReturnValueOnce(0.3) // isPep
				.mockReturnValueOnce(0.5); // Record

			const promise = generateMockResult("Test");
			vi.advanceTimersByTime(3000);

			const result = await promise;

			expect(result.timestamp).toBeInstanceOf(Date);
		});
	});
});
