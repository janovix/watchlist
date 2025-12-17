import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
	it("should convert string to lowercase", () => {
		expect(slugify("HELLO WORLD")).toBe("hello-world");
	});

	it("should trim whitespace", () => {
		expect(slugify("  hello world  ")).toBe("hello-world");
	});

	it("should remove quotes", () => {
		expect(slugify("hello'world")).toBe("helloworld");
		expect(slugify('hello"world')).toBe("helloworld");
		expect(slugify("hello' world")).toBe("hello-world");
		expect(slugify('hello" world')).toBe("hello-world");
	});

	it("should replace non-alphanumeric characters with hyphens", () => {
		expect(slugify("hello world")).toBe("hello-world");
		expect(slugify("hello@world")).toBe("hello-world");
		expect(slugify("hello.world")).toBe("hello-world");
	});

	it("should collapse multiple hyphens", () => {
		expect(slugify("hello---world")).toBe("hello-world");
		expect(slugify("hello   world")).toBe("hello-world");
	});

	it("should remove leading and trailing hyphens", () => {
		expect(slugify("-hello-world-")).toBe("hello-world");
		expect(slugify("hello-world-")).toBe("hello-world");
		expect(slugify("-hello-world")).toBe("hello-world");
	});

	it("should handle empty strings", () => {
		expect(slugify("")).toBe("");
	});

	it("should handle strings with only special characters", () => {
		expect(slugify("!!!")).toBe("");
		expect(slugify("---")).toBe("");
	});

	it("should handle mixed case with numbers", () => {
		expect(slugify("Hello123World")).toBe("hello123world");
		expect(slugify("Test123")).toBe("test123");
	});

	it("should handle accented characters", () => {
		expect(slugify("café")).toBe("caf");
		expect(slugify("naïve")).toBe("na-ve");
		expect(slugify("café bar")).toBe("caf-bar");
	});
});
