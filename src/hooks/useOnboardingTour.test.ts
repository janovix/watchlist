import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
	useOnboardingTour,
	WATCHLIST_ONBOARDING_DONE_KEY,
} from "./useOnboardingTour";

const { mockSearchParamsRef } = vi.hoisted(() => ({
	mockSearchParamsRef: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
	useSearchParams: () => mockSearchParamsRef.current,
}));

type DriverConfig = { onDestroyed?: () => void };

const mockDriver = vi.fn((config?: DriverConfig) => {
	const instance = {
		drive: vi.fn(),
		destroy: vi.fn(() => {
			config?.onDestroyed?.();
		}),
	};
	return instance;
});

vi.mock("driver.js", () => ({
	driver: (config?: DriverConfig) => mockDriver(config),
}));

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en" as const,
	}),
}));

describe("useOnboardingTour", () => {
	beforeEach(() => {
		mockSearchParamsRef.current = new URLSearchParams();
		vi.useFakeTimers();
		localStorage.clear();
		mockDriver.mockClear();
		vi.stubGlobal("navigator", { ...navigator, webdriver: false });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it("does not start the tour when enabled is false", () => {
		renderHook(() => useOnboardingTour(false));
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(mockDriver).not.toHaveBeenCalled();
	});

	it("does not start when onboarding was already completed", () => {
		localStorage.setItem(WATCHLIST_ONBOARDING_DONE_KEY, "true");
		renderHook(() => useOnboardingTour(true));
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(mockDriver).not.toHaveBeenCalled();
	});

	it("starts driver after delay when enabled and not completed", () => {
		renderHook(() => useOnboardingTour(true));
		act(() => {
			vi.advanceTimersByTime(600);
		});
		expect(mockDriver).toHaveBeenCalledTimes(1);
		expect(mockDriver.mock.results[0]?.value.drive).toHaveBeenCalled();
	});

	it("clears timeout on unmount and does not persist onboarding before drive", () => {
		const { unmount } = renderHook(() => useOnboardingTour(true));
		unmount();
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(mockDriver).not.toHaveBeenCalled();
		expect(localStorage.getItem(WATCHLIST_ONBOARDING_DONE_KEY)).toBeNull();
	});

	it("does not persist onboarding to localStorage when unmount destroys an active tour", () => {
		const { unmount } = renderHook(() => useOnboardingTour(true));
		act(() => {
			vi.advanceTimersByTime(600);
		});
		expect(mockDriver).toHaveBeenCalledTimes(1);
		unmount();
		expect(localStorage.getItem(WATCHLIST_ONBOARDING_DONE_KEY)).toBeNull();
	});

	it("does not start the tour when navigator.webdriver is true", () => {
		vi.stubGlobal("navigator", { ...navigator, webdriver: true });
		renderHook(() => useOnboardingTour(true));
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(mockDriver).not.toHaveBeenCalled();
	});

	it("starts the tour when navigator.webdriver is true and tour=force is in the URL", () => {
		vi.stubGlobal("navigator", { ...navigator, webdriver: true });
		mockSearchParamsRef.current = new URLSearchParams("tour=force");
		renderHook(() => useOnboardingTour(true));
		act(() => {
			vi.advanceTimersByTime(600);
		});
		expect(mockDriver).toHaveBeenCalledTimes(1);
	});
});
