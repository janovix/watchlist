import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
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
		const { container } = renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const ptButtons = screen.getAllByText("PT");
			expect(ptButtons.length).toBeGreaterThan(0);
		});
	});

	it("should close dropdown when clicking outside", async () => {
		const { container } = renderWithProvider(
			<div>
				<LanguageToggle />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const ptButtons = screen.queryAllByText("PT");
			expect(ptButtons.length).toBeGreaterThan(0);
		});

		const outside = screen.getByTestId("outside");
		fireEvent.mouseDown(outside);

		await waitFor(() => {
			// Dropdown should close - check that dropdown container is not visible
			const dropdown = container.querySelector(".absolute.top-full");
			expect(dropdown).not.toBeInTheDocument();
		});
	});

	it("should change language when a language option is clicked", async () => {
		vi.mocked(getCookie).mockReturnValue("es");

		renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const ptButton = screen.getByText("PT");
			fireEvent.click(ptButton);
		});

		await waitFor(() => {
			expect(setCookie).toHaveBeenCalledWith("janovix-lang", "pt");
		});
	});

	it("should highlight current language in dropdown", async () => {
		vi.mocked(getCookie).mockReturnValue("en");

		renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const allButtons = screen.getAllByRole("button");
			const enButton = allButtons.find((btn) => btn.textContent === "EN");
			expect(enButton).toBeDefined();
		});
	});

	it("should handle language change to English", async () => {
		vi.mocked(getCookie).mockReturnValue("es");

		renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const enButton = screen.getByText("EN");
			fireEvent.click(enButton);
		});

		await waitFor(() => {
			expect(setCookie).toHaveBeenCalledWith("janovix-lang", "en");
		});
	});

	it("should handle language change to Spanish", async () => {
		vi.mocked(getCookie).mockReturnValue("en");

		renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const esButton = screen.getByText("ES");
			fireEvent.click(esButton);
		});

		await waitFor(() => {
			expect(setCookie).toHaveBeenCalledWith("janovix-lang", "es");
		});
	});
});
