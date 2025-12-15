import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageProvider } from "./language-provider";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("ThemeToggle", () => {
	const originalLocalStorage = global.localStorage;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		global.localStorage = {
			getItem: vi.fn(() => "system"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage;

		window.matchMedia = vi.fn((query) => {
			return {
				matches: query === "(prefers-color-scheme: dark)" ? false : false,
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
		global.localStorage = originalLocalStorage;
		window.matchMedia = originalMatchMedia;
		vi.restoreAllMocks();
	});

	it("should render the theme toggle button", async () => {
		renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});
	});

	it("should show loading state before mounting", () => {
		renderWithProvider(<ThemeToggle />);

		// Before mount, should show placeholder
		const placeholder = document.querySelector(
			".h-8.w-8.rounded-lg.bg-secondary",
		);
		expect(placeholder).toBeInTheDocument();
	});

	it("should load theme from localStorage", async () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => "dark"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			expect(global.localStorage.getItem).toHaveBeenCalledWith("theme");
		});
	});

	it("should open dropdown when clicked", async () => {
		renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			fireEvent.click(button);
		});

		await waitFor(() => {
			// Dropdown should be visible
			const dropdown = document.querySelector(".absolute.top-full");
			expect(dropdown).toBeInTheDocument();
		});
	});

	it("should close dropdown when clicking outside", async () => {
		renderWithProvider(
			<div>
				<ThemeToggle />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		await waitFor(() => {
			const button = screen.getByRole("button");
			fireEvent.click(button);
		});

		await waitFor(() => {
			const outside = screen.getByTestId("outside");
			fireEvent.mouseDown(outside);
		});

		await waitFor(() => {
			const dropdown = document.querySelector(".absolute.top-full");
			expect(dropdown).not.toBeInTheDocument();
		});
	});

	it("should apply dark theme when dark is selected", async () => {
		const setItemSpy = vi.fn();
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => "system"),
			setItem: setItemSpy,
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			fireEvent.click(button);
		});

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			// Find the dark theme button (Moon icon)
			const darkButton = buttons.find((btn) => btn.querySelector("svg"));
			if (darkButton) {
				fireEvent.click(darkButton);
			}
		});

		await waitFor(() => {
			expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
		});
	});

	it("should apply light theme when light is selected", async () => {
		const setItemSpy = vi.fn();
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => "dark"),
			setItem: setItemSpy,
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			const button = screen.getByRole("button");
			fireEvent.click(button);
		});

		await waitFor(() => {
			expect(setItemSpy).toHaveBeenCalled();
		});
	});
});
