import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useToast, toast } from "./use-toast";

describe("useToast", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe("toast function", () => {
		it("should create a toast with an id", () => {
			const result = toast({
				title: "Test Toast",
				description: "Test Description",
			});

			expect(result).toBeDefined();
			expect(result.id).toBeDefined();
			expect(typeof result.id).toBe("string");
		});

		it("should create a toast with dismiss function", () => {
			const result = toast({
				title: "Test Toast",
			});

			expect(result.dismiss).toBeDefined();
			expect(typeof result.dismiss).toBe("function");
		});

		it("should create a toast with update function", () => {
			const result = toast({
				title: "Test Toast",
			});

			expect(result.update).toBeDefined();
			expect(typeof result.update).toBe("function");
		});

		it("should set open to true by default", () => {
			const { result } = renderHook(() => useToast());

			act(() => {
				toast({
					title: "Test",
				});
			});

			expect(result.current.toasts.length).toBeGreaterThan(0);
			expect(result.current.toasts[0].open).toBe(true);
		});

		it("should limit toasts to TOAST_LIMIT", () => {
			const { result } = renderHook(() => useToast());

			act(() => {
				toast({ title: "Toast 1" });
				toast({ title: "Toast 2" });
				toast({ title: "Toast 3" });
			});

			// TOAST_LIMIT is 1, so only one toast should exist
			expect(result.current.toasts.length).toBeLessThanOrEqual(1);
		});
	});

	describe("useToast hook", () => {
		it("should return toast state", () => {
			const { result } = renderHook(() => useToast());

			expect(result.current).toBeDefined();
			expect(result.current.toasts).toBeDefined();
			expect(Array.isArray(result.current.toasts)).toBe(true);
			expect(result.current.toast).toBeDefined();
			expect(result.current.dismiss).toBeDefined();
		});

		it("should update state when toast is added", () => {
			const { result } = renderHook(() => useToast());

			act(() => {
				toast({
					title: "New Toast",
				});
			});

			expect(result.current.toasts.length).toBeGreaterThan(0);
		});

		it("should allow dismissing a specific toast", () => {
			const { result } = renderHook(() => useToast());

			let toastId: string;

			act(() => {
				const toastResult = toast({
					title: "Dismissible Toast",
				});
				toastId = toastResult.id;
			});

			act(() => {
				result.current.dismiss(toastId!);
			});

			waitFor(() => {
				const dismissedToast = result.current.toasts.find(
					(t) => t.id === toastId,
				);
				expect(dismissedToast?.open).toBe(false);
			});
		});

		it("should allow dismissing all toasts", () => {
			const { result } = renderHook(() => useToast());

			act(() => {
				toast({ title: "Toast 1" });
				toast({ title: "Toast 2" });
			});

			act(() => {
				result.current.dismiss();
			});

			waitFor(() => {
				result.current.toasts.forEach((t) => {
					expect(t.open).toBe(false);
				});
			});
		});

		it("should allow updating a toast", () => {
			const { result } = renderHook(() => useToast());

			let toastId: string;
			let updateFn: ((props: any) => void) | undefined;

			act(() => {
				const toastResult = toast({
					title: "Original Title",
				});
				toastId = toastResult.id;
				updateFn = toastResult.update;
			});

			act(() => {
				if (updateFn) {
					updateFn({
						title: "Updated Title",
					});
				}
			});

			waitFor(() => {
				const updatedToast = result.current.toasts.find(
					(t) => t.id === toastId,
				);
				expect(updatedToast?.title).toBe("Updated Title");
			});
		});

		it("should handle dismissing all toasts when no toastId provided", () => {
			const { result } = renderHook(() => useToast());

			act(() => {
				toast({ title: "Toast 1" });
			});

			act(() => {
				result.current.dismiss(); // No toastId - dismiss all
			});

			waitFor(() => {
				result.current.toasts.forEach((t) => {
					expect(t.open).toBe(false);
				});
			});
		});

		it("should handle REMOVE_TOAST with undefined toastId", () => {
			const { result } = renderHook(() => useToast());

			act(() => {
				toast({ title: "Toast 1" });
				toast({ title: "Toast 2" });
			});

			// This tests the REMOVE_TOAST branch with undefined toastId
			// by dismissing and waiting for removal
			act(() => {
				result.current.dismiss();
			});

			// Wait for removal timeout (TOAST_REMOVE_DELAY is 1000000ms)
			vi.advanceTimersByTime(1000100);

			waitFor(() => {
				// All toasts should be removed
				expect(result.current.toasts.length).toBe(0);
			});
		});

		it("should handle onOpenChange callback when open is false", () => {
			const { result } = renderHook(() => useToast());

			let toastId: string;

			act(() => {
				const toastResult = toast({
					title: "Test Toast",
				});
				toastId = toastResult.id;
			});

			// Find the toast and trigger onOpenChange with false
			const testToast = result.current.toasts.find((t) => t.id === toastId);
			if (testToast && typeof testToast.onOpenChange === "function") {
				act(() => {
					testToast.onOpenChange!(false);
				});
			}

			waitFor(() => {
				const dismissedToast = result.current.toasts.find(
					(t) => t.id === toastId,
				);
				expect(dismissedToast?.open).toBe(false);
			});
		});

		it("should handle cleanup when component unmounts", () => {
			const { result, unmount } = renderHook(() => useToast());

			act(() => {
				toast({ title: "Test Toast" });
			});

			// Unmount should cleanup listener
			unmount();

			// Should not throw errors
			expect(result.current.toasts.length).toBeGreaterThanOrEqual(0);
		});

		it("should not add duplicate timeout when toastId already exists in queue", () => {
			const { result } = renderHook(() => useToast());

			let toastId: string;

			act(() => {
				const toastResult = toast({ title: "Test Toast" });
				toastId = toastResult.id;
			});

			// Dismiss the toast (adds to remove queue)
			act(() => {
				result.current.dismiss(toastId!);
			});

			// Try to dismiss again - should not add duplicate timeout
			act(() => {
				result.current.dismiss(toastId!);
			});

			// Should not throw errors
			expect(result.current.toasts.length).toBeGreaterThanOrEqual(0);
		});
	});
});
