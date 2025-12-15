import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LoadingView } from "./loading-view";
import { LanguageProvider } from "./language-provider";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("LoadingView", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should render loading view with search name", () => {
		renderWithProvider(<LoadingView searchName="John Doe" />);

		expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
	});

	it("should display progress bar", () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		const progressBar = document.querySelector(".h-2.bg-secondary");
		expect(progressBar).toBeInTheDocument();
	});

	it("should increment progress over time", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		// Advance timers
		vi.advanceTimersByTime(2000);

		await waitFor(() => {
			const progressText = screen.getByText(/%/);
			expect(progressText).toBeInTheDocument();
		});
	});

	it("should display elapsed time", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		vi.advanceTimersByTime(5000);

		await waitFor(() => {
			const timeText = screen.getByText(/Time elapsed|Tiempo transcurrido/i);
			expect(timeText).toBeInTheDocument();
		});
	});

	it("should display current step", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		vi.advanceTimersByTime(1000);

		await waitFor(() => {
			const stepText = screen.getByText(/Connecting|Conectando/i);
			expect(stepText).toBeInTheDocument();
		});
	});

	it("should display warning message", () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		const warning = screen.getByText(/Important|Importante/i);
		expect(warning).toBeInTheDocument();
	});

	it("should display animated dots", () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		const dots = document.querySelectorAll(".w-2.h-2.rounded-full.bg-primary");
		expect(dots.length).toBe(3);
	});

	it("should not exceed 95% progress", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		// Advance timers significantly
		vi.advanceTimersByTime(10000);

		await waitFor(() => {
			const progressText = screen.getByText(/%/);
			const progressValue = parseInt(progressText.textContent || "0");
			expect(progressValue).toBeLessThanOrEqual(95);
		});
	});

	it("should cycle through all steps", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		// Advance through all steps (5 steps * 3000ms each)
		vi.advanceTimersByTime(15000);

		await waitFor(() => {
			// Should show the last step
			const stepText = screen.getByText(/Generating|Generando/i);
			expect(stepText).toBeInTheDocument();
		});
	});
});
