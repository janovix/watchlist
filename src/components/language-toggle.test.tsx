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
		renderWithProvider(<LanguageToggle />);

		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();
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

		renderWithProvider(<LanguageToggle />);

		await waitFor(() => {
			expect(screen.getByText("EN")).toBeInTheDocument();
		});
	});

	it("should open dropdown when clicked", async () => {
		renderWithProvider(<LanguageToggle />);

		const button = screen.getByRole("button");
		fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText("PT")).toBeInTheDocument();
			expect(screen.getByText("ES")).toBeInTheDocument();
			expect(screen.getByText("EN")).toBeInTheDocument();
		});
	});

	it("should close dropdown when clicking outside", async () => {
		renderWithProvider(
			<div>
				<LanguageToggle />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		const button = screen.getByRole("button");
		fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText("PT")).toBeInTheDocument();
		});

		const outside = screen.getByTestId("outside");
		fireEvent.mouseDown(outside);

		await waitFor(() => {
			expect(screen.queryByText("PT")).not.toBeInTheDocument();
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

		renderWithProvider(<LanguageToggle />);

		const button = screen.getByRole("button");
		fireEvent.click(button);

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

		renderWithProvider(<LanguageToggle />);

		const button = screen.getByRole("button");
		fireEvent.click(button);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			const enButton = buttons.find((btn) => btn.textContent === "EN");
			expect(enButton).toHaveClass("bg-background");
		});
	});
});
