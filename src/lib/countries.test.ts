import { describe, it, expect } from "vitest";
import { COUNTRY_OPTIONS, getCountryByCode, getCountryName } from "./countries";

describe("countries", () => {
	it("exports a non-empty list of country options", () => {
		expect(COUNTRY_OPTIONS.length).toBeGreaterThan(0);
		COUNTRY_OPTIONS.forEach((c) => {
			expect(c.code).toMatch(/^[A-Z]{2}$/);
			expect(c.name).toBeTruthy();
		});
	});

	it("includes common jurisdictions", () => {
		const codes = new Set(COUNTRY_OPTIONS.map((c) => c.code));
		expect(codes.has("MX")).toBe(true);
		expect(codes.has("US")).toBe(true);
		expect(codes.has("GB")).toBe(true);
		expect(codes.has("CO")).toBe(true);
	});

	it("getCountryByCode returns option for valid code", () => {
		expect(getCountryByCode("MX")).toEqual({ code: "MX", name: "Mexico" });
		expect(getCountryByCode("mx")).toEqual({ code: "MX", name: "Mexico" });
		expect(getCountryByCode("US")).toEqual({
			code: "US",
			name: "United States",
		});
	});

	it("getCountryByCode returns undefined for unknown code", () => {
		expect(getCountryByCode("ZZ")).toBeUndefined();
		expect(getCountryByCode("")).toBeUndefined();
	});

	it("getCountryName returns name for valid code", () => {
		expect(getCountryName("MX")).toBe("Mexico");
		expect(getCountryName("us")).toBe("United States");
	});

	it("getCountryName returns code for unknown code", () => {
		expect(getCountryName("ZZ")).toBe("ZZ");
	});
});
