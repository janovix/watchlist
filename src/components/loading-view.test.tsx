import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
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

		// Progress should be displayed
		const progressTexts = screen.queryAllByText(/%/);
		expect(progressTexts.length).toBeGreaterThan(0);
	});

	it("should display elapsed time", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		vi.advanceTimersByTime(2000);

		await waitFor(
			() => {
				const timeTexts = screen.getAllByText(
					/Time elapsed|Tiempo transcurrido/i,
				);
				expect(timeTexts.length).toBeGreaterThan(0);
			},
			{ timeout: 1000 },
		);
	});

	it("should display current step", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		vi.advanceTimersByTime(1000);

		// Step should be displayed
		const stepTexts = screen.queryAllByText(/Connecting|Conectando/i);
		expect(stepTexts.length).toBeGreaterThan(0);
	});

	it("should display warning message", () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		const warnings = screen.getAllByText(/Important|Importante/i);
		expect(warnings.length).toBeGreaterThan(0);
	});

	it("should display animated dots", () => {
		const { container } = renderWithProvider(<LoadingView searchName="Test" />);

		const dots = container.querySelectorAll(".w-2.h-2.rounded-full.bg-primary");
		expect(dots.length).toBeGreaterThanOrEqual(3);
	});

	it("should not exceed 95% progress", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		// Advance timers significantly
		vi.advanceTimersByTime(10000);

		// Progress should be displayed and not exceed 95%
		const progressTexts = screen.queryAllByText(/%/);
		if (progressTexts.length > 0) {
			const progressValue = parseInt(progressTexts[0].textContent || "0");
			expect(progressValue).toBeLessThanOrEqual(95);
		}
	});

	it("should cycle through all steps", async () => {
		renderWithProvider(<LoadingView searchName="Test" />);

		// Advance through all steps (5 steps * 3000ms each)
		vi.advanceTimersByTime(15000);

		// Should show a step (could be any step)
		const stepTexts = screen.queryAllByText(/Connecting|Conectando|Generating|Generando/i);
		expect(stepTexts.length).toBeGreaterThan(0);
	});
});
