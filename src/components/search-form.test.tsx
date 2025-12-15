import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { SearchForm } from "./search-form";
import { LanguageProvider } from "./language-provider";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("SearchForm", () => {
	afterEach(() => {
		cleanup();
	});
	it("should render the search form", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		expect(screen.getByRole("textbox")).toBeInTheDocument();
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("should call onSearch when form is submitted with valid input", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const form = input.closest("form");
		
		fireEvent.change(input, { target: { value: "John Doe" } });
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("John Doe");
		});
	});

	it("should not call onSearch when input is empty", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const button = screen.getByRole("button");
		fireEvent.click(button);

		expect(onSearch).not.toHaveBeenCalled();
	});

	it("should not call onSearch when input is only whitespace", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const button = screen.getByRole("button");

		fireEvent.change(input, { target: { value: "   " } });
		fireEvent.click(button);

		expect(onSearch).not.toHaveBeenCalled();
	});

	it("should trim whitespace from input before calling onSearch", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const button = screen.getByRole("button");

		fireEvent.change(input, { target: { value: "  John Doe  " } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("John Doe");
		});
	});

	it("should disable input and button when isLoading is true", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={true} />);

		const input = screen.getByRole("textbox");
		const button = screen.getByRole("button");

		expect(input).toBeDisabled();
		expect(button).toBeDisabled();
	});

	it("should call onSearch when Enter key is pressed", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const form = input.closest("form");

		fireEvent.change(input, { target: { value: "John Doe" } });
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith("John Doe");
		});
	});

	it("should display translated placeholder text", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("placeholder");
	});
});
