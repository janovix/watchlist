import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageProvider } from "./language-provider";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("ThemeToggle", () => {
	afterEach(() => {
		cleanup();
	});
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
			".h-7.w-7.sm\\:h-8.sm\\:w-8.rounded-lg.bg-secondary, .h-8.w-8.rounded-lg.bg-secondary",
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
		const { container } = renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			const toggleButton = buttons[0]; // Get the first button (toggle button)
			fireEvent.click(toggleButton);
		});

		await waitFor(() => {
			// Dropdown should be visible
			const dropdown = container.querySelector(".absolute.top-full");
			expect(dropdown).toBeInTheDocument();
		});
	});

	it("should close dropdown when clicking outside", async () => {
		const { container } = renderWithProvider(
			<div>
				<ThemeToggle />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			const toggleButton = buttons[0]; // Get the first button (toggle button)
			fireEvent.click(toggleButton);
		});

		await waitFor(() => {
			const outside = screen.getByTestId("outside");
			fireEvent.mouseDown(outside);
		});

		await waitFor(() => {
			const dropdown = container.querySelector(".absolute.top-full");
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

		const { container } = renderWithProvider(<ThemeToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			const toggleButton = buttons[0]; // Get the first button (toggle button)
			fireEvent.click(toggleButton);
		});

		await waitFor(() => {
			// Find the dark theme button (Moon icon) - should be in dropdown
			const dropdown = container.querySelector(".absolute.top-full");
			if (dropdown) {
				const allButtons = dropdown.querySelectorAll("button");
				// Find button with Moon icon (dark theme) - it's the third button (system, light, dark)
				const darkButton =
					Array.from(allButtons).find((btn) => {
						const svg = btn.querySelector("svg");
						return svg && svg.classList.contains("lucide-moon");
					}) || Array.from(allButtons)[2]; // Fallback to third button
				if (darkButton) {
					fireEvent.click(darkButton);
				}
			}
		});

		await waitFor(
			() => {
				// Check that setItem was called with "theme" and "dark" (may be called multiple times)
				const calls = setItemSpy.mock.calls;
				const themeDarkCall = calls.find(
					(call) => call[0] === "theme" && call[1] === "dark",
				);
				expect(themeDarkCall).toBeDefined();
			},
			{ timeout: 2000 },
		);
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
			const buttons = screen.getAllByRole("button");
			const toggleButton = buttons[0]; // Get the first button (toggle button)
			fireEvent.click(toggleButton);
		});

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			// Find the light theme button (Sun icon) - should be in dropdown
			const lightButton = buttons.find(
				(btn) => btn.querySelector("svg") && btn.closest(".absolute"), // Should be in dropdown
			);
			if (lightButton) {
				fireEvent.click(lightButton);
			}
		});

		await waitFor(() => {
			expect(setItemSpy).toHaveBeenCalled();
		});
	});
});
