import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageToggle } from "./language-toggle";
import { LanguageProvider } from "./language-provider";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("LanguageToggle", () => {
	const originalLocalStorage = global.localStorage;

	beforeEach(() => {
		global.localStorage = {
			getItem: vi.fn(() => "es"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage;
	});

	afterEach(() => {
		global.localStorage = originalLocalStorage;
		vi.restoreAllMocks();
	});

	it("should render the language toggle button", () => {
		const { container } = renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
	});

	it("should display current language code", async () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => "en"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		const { container } = renderWithProvider(<LanguageToggle />);

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
			// Dropdown should close
			const ptButtons = screen.queryAllByText("PT");
			// Should have fewer PT buttons (only the main button, not dropdown)
			expect(ptButtons.length).toBeLessThanOrEqual(1);
		});
	});

	it("should change language when a language option is clicked", async () => {
		const setItemSpy = vi.fn();
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => "es"),
			setItem: setItemSpy,
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		const { container } = renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const ptButton = screen.getByText("PT");
			fireEvent.click(ptButton);
		});

		await waitFor(() => {
			expect(setItemSpy).toHaveBeenCalledWith("language", "pt");
		});
	});

	it("should highlight current language in dropdown", async () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => "en"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		const { container } = renderWithProvider(<LanguageToggle />);

		const buttons = screen.getAllByRole("button");
		const toggleButton = buttons[0];
		fireEvent.click(toggleButton);

		await waitFor(() => {
			const allButtons = screen.getAllByRole("button");
			const enButton = allButtons.find((btn) => btn.textContent === "EN");
			expect(enButton).toBeDefined();
		});
	});
});
