import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
	PageTransitionProvider,
	usePageTransition,
} from "./page-transition-context";

describe("PageTransitionProvider", () => {
	it("provides default enter direction of 'none'", () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		expect(result.current.getEnterDirection()).toBe("none");
	});

	it("allows setting enter direction", () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		act(() => {
			result.current.setEnterDirection("up");
		});

		expect(result.current.getEnterDirection()).toBe("up");

		act(() => {
			result.current.setEnterDirection("down");
		});

		expect(result.current.getEnterDirection()).toBe("down");
	});

	it("triggerExit notifies subscribers", () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		const listener = vi.fn();

		act(() => {
			result.current.subscribe(listener);
		});

		act(() => {
			result.current.triggerExit("up", 100);
		});

		expect(listener).toHaveBeenCalledWith("up");
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("triggerExit returns promise that resolves after duration", async () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		const startTime = Date.now();

		await act(async () => {
			await result.current.triggerExit("down", 50);
		});

		const elapsed = Date.now() - startTime;

		// Should resolve after ~50ms (with some tolerance)
		expect(elapsed).toBeGreaterThanOrEqual(45);
		expect(elapsed).toBeLessThan(100);
	});

	it("triggerExit uses default duration of 400ms", async () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		const startTime = Date.now();

		await act(async () => {
			await result.current.triggerExit("up");
		});

		const elapsed = Date.now() - startTime;

		// Should resolve after ~400ms
		expect(elapsed).toBeGreaterThanOrEqual(390);
		expect(elapsed).toBeLessThan(500);
	});

	it("allows unsubscribing from exit events", () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		const listener = vi.fn();

		let unsubscribe: () => void;
		act(() => {
			unsubscribe = result.current.subscribe(listener);
		});

		act(() => {
			result.current.triggerExit("up", 10);
		});

		expect(listener).toHaveBeenCalledTimes(1);

		act(() => {
			unsubscribe();
		});

		act(() => {
			result.current.triggerExit("down", 10);
		});

		// Should not be called again after unsubscribe
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("supports multiple subscribers", () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		const listener1 = vi.fn();
		const listener2 = vi.fn();

		act(() => {
			result.current.subscribe(listener1);
			result.current.subscribe(listener2);
		});

		act(() => {
			result.current.triggerExit("down", 10);
		});

		expect(listener1).toHaveBeenCalledWith("down");
		expect(listener2).toHaveBeenCalledWith("down");
	});

	it("throws error when usePageTransition is used outside provider", () => {
		// Suppress console.error for this test
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => {
			renderHook(() => usePageTransition());
		}).toThrow("usePageTransition must be used within PageTransitionProvider");

		consoleError.mockRestore();
	});

	it("handles all direction types", () => {
		const { result } = renderHook(() => usePageTransition(), {
			wrapper: PageTransitionProvider,
		});

		const listener = vi.fn();

		act(() => {
			result.current.subscribe(listener);
		});

		act(() => {
			result.current.triggerExit("up", 10);
		});
		expect(listener).toHaveBeenLastCalledWith("up");

		act(() => {
			result.current.triggerExit("down", 10);
		});
		expect(listener).toHaveBeenLastCalledWith("down");

		act(() => {
			result.current.triggerExit("none", 10);
		});
		expect(listener).toHaveBeenLastCalledWith("none");

		expect(listener).toHaveBeenCalledTimes(3);
	});
});
