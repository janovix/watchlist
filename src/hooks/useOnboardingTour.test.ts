import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
	useOnboardingTour,
	WATCHLIST_ONBOARDING_DONE_KEY,
} from "./useOnboardingTour";

const mockDriver = vi.fn((_config?: unknown) => ({
	drive: vi.fn(),
	destroy: vi.fn(),
}));

vi.mock("driver.js", () => ({
	driver: (config?: unknown) => mockDriver(config),
}));

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en" as const,
	}),
}));

describe("useOnboardingTour", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		localStorage.clear();
		mockDriver.mockClear();
	});

	afterEach(() => {
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

	it("clears timeout on unmount", () => {
		const { unmount } = renderHook(() => useOnboardingTour(true));
		unmount();
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(mockDriver).not.toHaveBeenCalled();
	});
});
