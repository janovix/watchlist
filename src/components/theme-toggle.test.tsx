import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

		await waitFor(
			() => {
				const buttons = screen.getAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			},
			{ timeout: 3000 },
		);
	});

	it("should show loading state before mounting", async () => {
		const { container } = renderWithProvider(<ThemeToggle />);

		// Before mount, should show placeholder - check immediately
		const placeholder = container.querySelector(".bg-secondary");
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

		await waitFor(
			() => {
				expect(global.localStorage.getItem).toHaveBeenCalledWith("theme");
			},
			{ timeout: 3000 },
		);
	});

	it("should open dropdown when clicked", async () => {
		const user = userEvent.setup();
		// Test with mini variant which uses dropdown
		renderWithProvider(<ThemeToggle variant="mini" />);

		await waitFor(
			() => {
				const buttons = screen.getAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			},
			{ timeout: 3000 },
		);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		await user.click(toggleButton);

		// Wait for dropdown menu items to appear (portaled content)
		await waitFor(
			() => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
			},
			{ timeout: 3000 },
		);
	});

	it("should close dropdown when clicking outside", async () => {
		const user = userEvent.setup();
		// Test with mini variant which uses dropdown
		renderWithProvider(
			<div>
				<ThemeToggle variant="mini" />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		await waitFor(
			() => {
				const buttons = screen.getAllByRole("button");
				expect(buttons.length).toBeGreaterThan(0);
			},
			{ timeout: 3000 },
		);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		await user.click(toggleButton);

		// Wait for dropdown to open
		await waitFor(
			() => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
			},
			{ timeout: 3000 },
		);

		const outside = screen.getByTestId("outside");
		await user.click(outside);

		// Wait for dropdown to close (menu items should disappear)
		await waitFor(
			() => {
				const menuItems = screen.queryAllByRole("menuitem");
				expect(menuItems.length).toBe(0);
			},
			{ timeout: 3000 },
		);
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
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThanOrEqual(3);
		});

		const buttons = screen.getAllByRole("button");
		// Find the dark theme button (Moon icon) - should be one of the visible buttons
		const darkButton = buttons.find((btn) => {
			const svg = btn.querySelector("svg");
			return svg && svg.classList.contains("lucide-moon");
		});

		if (darkButton) {
			fireEvent.click(darkButton);
		}

		await waitFor(
			() => {
				const calls = setItemSpy.mock.calls;
				const themeDarkCall = calls.find(
					(call) => call[0] === "theme" && call[1] === "dark",
				);
				expect(themeDarkCall).toBeDefined();
			},
			{ timeout: 3000 },
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

		await waitFor(
			() => {
				const buttons = screen.getAllByRole("button");
				expect(buttons.length).toBeGreaterThanOrEqual(3);
			},
			{ timeout: 3000 },
		);

		const buttons = screen.getAllByRole("button");
		// Find the light theme button (Sun icon) - should be one of the visible buttons
		const lightButton = buttons.find((btn) => {
			const svg = btn.querySelector("svg");
			return svg && svg.classList.contains("lucide-sun");
		});

		if (lightButton) {
			fireEvent.click(lightButton);
		}

		await waitFor(
			() => {
				expect(setItemSpy).toHaveBeenCalled();
			},
			{ timeout: 3000 },
		);
	});
});
