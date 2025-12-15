import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
	const originalInnerWidth = window.innerWidth;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		vi.spyOn(window, "matchMedia").mockImplementation((query) => {
			const isMobile = window.innerWidth < 768;
			return {
				matches: query.includes("max-width") && isMobile,
				media: query,
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn(),
			} as MediaQueryList;
		});
	});

	afterEach(() => {
		window.innerWidth = originalInnerWidth;
		window.matchMedia = originalMatchMedia;
		vi.restoreAllMocks();
	});

	it("should return true when window width is less than 768px", async () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		const { result } = renderHook(() => useIsMobile());

		await waitFor(() => {
			expect(result.current).toBe(true);
		});
	});

	it("should return false when window width is greater than or equal to 768px", async () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});

		const { result } = renderHook(() => useIsMobile());

		await waitFor(() => {
			expect(result.current).toBe(false);
		});
	});

	it("should update when window width changes", async () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		const { result, rerender } = renderHook(() => useIsMobile());

		await waitFor(() => {
			expect(result.current).toBe(true);
		});

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});

		// Trigger resize event
		window.dispatchEvent(new Event("resize"));
		rerender();

		await waitFor(() => {
			expect(result.current).toBe(false);
		});
	});

	it("should return boolean value", async () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		const { result } = renderHook(() => useIsMobile());

		await waitFor(() => {
			expect(typeof result.current).toBe("boolean");
		});
	});
});
