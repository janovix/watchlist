import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
	BackgroundSpeedProvider,
	useBackgroundSpeed,
} from "./background-speed-context";

describe("BackgroundSpeedProvider", () => {
	it("provides default speed of 0.3", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		expect(result.current.getSpeed()).toBe(0.3);
	});

	it("allows setting custom speed", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		act(() => {
			result.current.setSpeed(0.8);
		});

		expect(result.current.getSpeed()).toBe(0.8);
	});

	it("notifies subscribers when speed changes", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		const listener = vi.fn();

		act(() => {
			result.current.subscribe(listener);
		});

		act(() => {
			result.current.setSpeed(1.2);
		});

		expect(listener).toHaveBeenCalledWith(1.2);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("allows unsubscribing from speed changes", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		const listener = vi.fn();

		let unsubscribe: () => void;
		act(() => {
			unsubscribe = result.current.subscribe(listener);
		});

		act(() => {
			result.current.setSpeed(0.5);
		});

		expect(listener).toHaveBeenCalledTimes(1);

		act(() => {
			unsubscribe();
		});

		act(() => {
			result.current.setSpeed(0.7);
		});

		// Should not be called again after unsubscribe
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("startSearching sets speed to 1.5 and isSearching to true", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		act(() => {
			result.current.startSearching();
		});

		expect(result.current.getSpeed()).toBe(1.5);
		expect(result.current.isSearching()).toBe(true);
	});

	it("stopSearching sets speed to 0.3 and isSearching to false", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		act(() => {
			result.current.startSearching();
		});

		expect(result.current.isSearching()).toBe(true);

		act(() => {
			result.current.stopSearching();
		});

		expect(result.current.getSpeed()).toBe(0.3);
		expect(result.current.isSearching()).toBe(false);
	});

	it("notifies subscribers when startSearching is called", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		const listener = vi.fn();

		act(() => {
			result.current.subscribe(listener);
		});

		act(() => {
			result.current.startSearching();
		});

		expect(listener).toHaveBeenCalledWith(1.5);
	});

	it("notifies subscribers when stopSearching is called", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		const listener = vi.fn();

		act(() => {
			result.current.subscribe(listener);
			result.current.startSearching();
		});

		listener.mockClear();

		act(() => {
			result.current.stopSearching();
		});

		expect(listener).toHaveBeenCalledWith(0.3);
	});

	it("throws error when useBackgroundSpeed is used outside provider", () => {
		// Suppress console.error for this test
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => {
			renderHook(() => useBackgroundSpeed());
		}).toThrow(
			"useBackgroundSpeed must be used within a BackgroundSpeedProvider",
		);

		consoleError.mockRestore();
	});

	it("supports multiple subscribers", () => {
		const { result } = renderHook(() => useBackgroundSpeed(), {
			wrapper: BackgroundSpeedProvider,
		});

		const listener1 = vi.fn();
		const listener2 = vi.fn();

		act(() => {
			result.current.subscribe(listener1);
			result.current.subscribe(listener2);
		});

		act(() => {
			result.current.setSpeed(0.9);
		});

		expect(listener1).toHaveBeenCalledWith(0.9);
		expect(listener2).toHaveBeenCalledWith(0.9);
	});
});
