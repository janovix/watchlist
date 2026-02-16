import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageToggle } from "./language-toggle";
import { LanguageProvider } from "./language-provider";

// Mock cookies module
vi.mock("@/lib/cookies", () => ({
	getCookie: vi.fn(),
	setCookie: vi.fn(),
	COOKIE_NAMES: {
		THEME: "janovix-theme",
		LANGUAGE: "janovix-lang",
	},
}));

// Mock settings module
vi.mock("@/lib/settings", () => ({
	getResolvedSettings: vi.fn(),
	updateUserSettings: vi.fn(),
}));

import { getCookie, setCookie } from "@/lib/cookies";
import { getResolvedSettings, updateUserSettings } from "@/lib/settings";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("LanguageToggle", () => {
	afterEach(() => {
		cleanup();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getCookie).mockReturnValue("es");
		vi.mocked(getResolvedSettings).mockRejectedValue(
			new Error("Not authenticated"),
		);
		vi.mocked(updateUserSettings).mockResolvedValue({} as never);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render the language toggle button", () => {
		const { container } = renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should display current language code", async () => {
		vi.mocked(getCookie).mockReturnValue("en");

		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			expect(screen.getByText("EN")).toBeInTheDocument();
		});
	});

	it("should open dropdown when clicked", async () => {
		const user = userEvent.setup();
		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		await user.click(toggleButton);

		// Wait for dropdown menu items to appear (portaled content)
		await waitFor(
			() => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
				const ptButton = menuItems.find((item) => item.textContent === "PT");
				expect(ptButton).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});

	it("should close dropdown when clicking outside", async () => {
		const user = userEvent.setup();
		renderWithProvider(
			<div>
				<LanguageToggle />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

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

	it("should change language when a language option is clicked", async () => {
		const user = userEvent.setup();
		vi.mocked(getCookie).mockReturnValue("es");

		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		await user.click(toggleButton);

		// Wait for dropdown to open and find PT menu item
		await waitFor(
			async () => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
				const ptButton = menuItems.find((item) => item.textContent === "PT");
				expect(ptButton).toBeInTheDocument();
				if (ptButton) {
					await user.click(ptButton);
				}
			},
			{ timeout: 3000 },
		);

		await waitFor(
			() => {
				expect(setCookie).toHaveBeenCalledWith("janovix-lang", "pt");
			},
			{ timeout: 3000 },
		);
	});

	it("should highlight current language in dropdown", async () => {
		vi.mocked(getCookie).mockReturnValue("en");

		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(
			() => {
				const allButtons = screen.getAllByRole("button");
				const enButton = allButtons.find((btn) => btn.textContent === "EN");
				expect(enButton).toBeDefined();
			},
			{ timeout: 3000 },
		);
	});

	it("should handle language change to English", async () => {
		const user = userEvent.setup();
		vi.mocked(getCookie).mockReturnValue("es");

		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		await user.click(toggleButton);

		// Wait for dropdown to open and find EN menu item
		await waitFor(
			async () => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
				const enButton = menuItems.find((item) => item.textContent === "EN");
				expect(enButton).toBeInTheDocument();
				if (enButton) {
					await user.click(enButton);
				}
			},
			{ timeout: 3000 },
		);

		await waitFor(
			() => {
				expect(setCookie).toHaveBeenCalledWith("janovix-lang", "en");
			},
			{ timeout: 3000 },
		);
	});

	it("should handle language change to Spanish", async () => {
		const user = userEvent.setup();
		vi.mocked(getCookie).mockReturnValue("en");

		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		await user.click(toggleButton);

		// Wait for dropdown to open and find ES menu item
		await waitFor(
			async () => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
				const esButton = menuItems.find((item) => item.textContent === "ES");
				expect(esButton).toBeInTheDocument();
				if (esButton) {
					await user.click(esButton);
				}
			},
			{ timeout: 3000 },
		);

		await waitFor(
			() => {
				expect(setCookie).toHaveBeenCalledWith("janovix-lang", "es");
			},
			{ timeout: 3000 },
		);
	});

	it("should render with mini variant", () => {
		renderWithProvider(<LanguageToggle variant="mini" />);

		// The component should render without errors with mini variant
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should render with default variant", () => {
		renderWithProvider(<LanguageToggle variant="default" />);

		// The component should render without errors with default variant
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});
});
