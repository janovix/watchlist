import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
	const originalInnerWidth = window.innerWidth;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		// Mock matchMedia
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: vi.fn().mockImplementation((query) => {
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
			}),
		});
	});

	afterEach(() => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: originalInnerWidth,
		});
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			configurable: true,
			value: originalMatchMedia,
		});
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
		let changeCallback: (() => void) | null = null;
		const mockAddEventListener = vi.fn(
			(event: string, callback: () => void) => {
				if (event === "change") {
					changeCallback = callback;
				}
			},
		);

		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		Object.defineProperty(window, "matchMedia", {
			writable: true,
			configurable: true,
			value: vi.fn().mockImplementation((query) => {
				const isMobile = window.innerWidth < 768;
				return {
					matches: query.includes("max-width") && isMobile,
					media: query,
					onchange: null,
					addListener: vi.fn(),
					removeListener: vi.fn(),
					addEventListener: mockAddEventListener,
					removeEventListener: vi.fn(),
					dispatchEvent: vi.fn(),
				} as MediaQueryList;
			}),
		});

		const { result } = renderHook(() => useIsMobile());

		await waitFor(() => {
			expect(result.current).toBe(true);
		});

		// Update width
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});

		// Trigger the change callback that was registered
		if (changeCallback) {
			changeCallback();
		}

		await waitFor(
			() => {
				expect(result.current).toBe(false);
			},
			{ timeout: 3000 },
		);
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
