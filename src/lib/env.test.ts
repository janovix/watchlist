import { describe, it, expect } from "vitest";
import { requireEnv } from "./env";

describe("requireEnv", () => {
	it("throws when value is undefined", () => {
		expect(() => requireEnv("MY_VAR", undefined)).toThrow(
			/Missing required environment variable: MY_VAR/,
		);
	});

	it("throws when value is empty string", () => {
		expect(() => requireEnv("MY_VAR", "")).toThrow(
			/Missing required environment variable: MY_VAR/,
		);
	});

	it("throws when value is whitespace only", () => {
		expect(() => requireEnv("MY_VAR", "   \t")).toThrow(
			/Missing required environment variable: MY_VAR/,
		);
	});

	it("returns trimmed value and strips trailing slash", () => {
		expect(requireEnv("URL", "  https://example.com/  ")).toBe(
			"https://example.com",
		);
	});

	it("returns trimmed value without stripping when no trailing slash", () => {
		expect(requireEnv("URL", " https://example.com ")).toBe(
			"https://example.com",
		);
	});
});
