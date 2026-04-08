import { describe, it, expect } from "vitest";
import {
	looksLikeUrl,
	ensureProtocol,
	extractHostname,
} from "./pdf-text-utils";

describe("pdf-text-utils", () => {
	describe("looksLikeUrl", () => {
		it.each([
			["https://example.com", true],
			["http://example.com/path", true],
			["example.com", true],
			["sub.domain.example.org", true],
			["not a url", false],
			["", false],
		] as const)("looksLikeUrl(%s) === %s", (input, expected) => {
			expect(looksLikeUrl(input)).toBe(expected);
		});
	});

	describe("ensureProtocol", () => {
		it("preserves existing scheme", () => {
			expect(ensureProtocol("https://a.com")).toBe("https://a.com");
			expect(ensureProtocol("http://a.com")).toBe("http://a.com");
		});

		it("adds https for bare domains", () => {
			expect(ensureProtocol("example.com")).toBe("https://example.com");
			expect(ensureProtocol("  foo.bar  ")).toBe("https://foo.bar");
		});
	});

	describe("extractHostname", () => {
		it("parses full URLs", () => {
			expect(extractHostname("https://news.example.com/path")).toBe(
				"news.example.com",
			);
		});

		it("parses bare domains", () => {
			expect(extractHostname("example.com")).toBe("example.com");
		});

		it("returns original string when URL parsing fails", () => {
			expect(extractHostname("not a url!!!")).toBe("not a url!!!");
		});
	});
});
