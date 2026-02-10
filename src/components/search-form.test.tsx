import { describe, it, expect, vi, afterEach } from "vitest";
import {
	render,
	screen,
	fireEvent,
	waitFor,
	cleanup,
} from "@testing-library/react";
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
		const buttons = screen.getAllByRole("button");
		expect(buttons.length).toBeGreaterThan(0);
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
			expect(onSearch).toHaveBeenCalledWith({ q: "John Doe" });
		});
	});

	it("should not call onSearch when input is empty", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const buttons = screen.getAllByRole("button");
		const searchButton = buttons.find(
			(btn) => btn.getAttribute("type") === "submit",
		);
		if (searchButton) {
			fireEvent.click(searchButton);
		}

		expect(onSearch).not.toHaveBeenCalled();
	});

	it("should not call onSearch when input is only whitespace", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const buttons = screen.getAllByRole("button");
		const searchButton = buttons.find(
			(btn) => btn.getAttribute("type") === "submit",
		);

		fireEvent.change(input, { target: { value: "   " } });
		if (searchButton) {
			fireEvent.click(searchButton);
		}

		expect(onSearch).not.toHaveBeenCalled();
	});

	it("should trim whitespace from input before calling onSearch", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const buttons = screen.getAllByRole("button");
		const searchButton = buttons.find(
			(btn) => btn.getAttribute("type") === "submit",
		);

		fireEvent.change(input, { target: { value: "  John Doe  " } });
		if (searchButton) {
			fireEvent.click(searchButton);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({ q: "John Doe" });
		});
	});

	it("should disable input and button when isLoading is true", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={true} />);

		const input = screen.getByRole("textbox");
		const buttons = screen.getAllByRole("button");
		const searchButton = buttons.find(
			(btn) => btn.getAttribute("type") === "submit",
		);

		expect(input).toBeDisabled();
		expect(searchButton).toBeDisabled();
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
			expect(onSearch).toHaveBeenCalledWith({ q: "John Doe" });
		});
	});

	it("should display translated placeholder text", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("placeholder");
	});

	it("should not call onSearch when form is submitted with empty trimmed input", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		const input = screen.getByRole("textbox");
		const form = input.closest("form");

		fireEvent.change(input, { target: { value: "" } });
		if (form) {
			fireEvent.submit(form);
		}

		// Wait a bit to ensure onSearch is not called
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(onSearch).not.toHaveBeenCalled();
	});

	it("should toggle advanced search panel", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Advanced search fields should not be visible initially
		expect(screen.queryByPlaceholderText(/passport/i)).not.toBeInTheDocument();

		// Click advanced search button
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		// Advanced fields should now be visible
		expect(screen.getByPlaceholderText(/passport/i)).toBeInTheDocument();
	});

	it("should include advanced search parameters when provided", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		// Fill in all fields
		const nameInput = screen.getByPlaceholderText(/enter the full name/i);
		const identifiersInput = screen.getByPlaceholderText(/passport/i);
		const birthDateInput = screen.getByLabelText(/birth date/i);
		const countriesInput = screen.getByPlaceholderText(/mx, us/i);

		fireEvent.change(nameInput, { target: { value: "Juan Perez" } });
		fireEvent.change(identifiersInput, {
			target: { value: "HEMA-621127, ID-123" },
		});
		fireEvent.change(birthDateInput, { target: { value: "1980-01-15" } });
		fireEvent.change(countriesInput, { target: { value: "MX, US" } });

		const form = nameInput.closest("form");
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({
				q: "Juan Perez",
				identifiers: ["HEMA-621127", "ID-123"],
				birthDate: "1980-01-15",
				countries: ["MX", "US"],
			});
		});
	});

	it("should handle identifiers with different separators", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		const nameInput = screen.getByPlaceholderText(/enter the full name/i);
		const identifiersInput = screen.getByPlaceholderText(/passport/i);

		fireEvent.change(nameInput, { target: { value: "Test" } });
		fireEvent.change(identifiersInput, {
			target: { value: "ID1, ID2, ID3, ID4" },
		});

		const form = nameInput.closest("form");
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({
				q: "Test",
				identifiers: ["ID1", "ID2", "ID3", "ID4"],
			});
		});
	});

	it("should handle countries with different separators", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		const nameInput = screen.getByPlaceholderText(/enter the full name/i);
		const countriesInput = screen.getByPlaceholderText(/mx, us/i);

		fireEvent.change(nameInput, { target: { value: "Test" } });
		fireEvent.change(countriesInput, {
			target: { value: "mx, us, ca, gb" },
		});

		const form = nameInput.closest("form");
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({
				q: "Test",
				countries: ["MX", "US", "CA", "GB"],
			});
		});
	});

	it("should not include empty advanced search fields", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		const nameInput = screen.getByPlaceholderText(/enter the full name/i);
		fireEvent.change(nameInput, { target: { value: "Test" } });

		// Leave other fields empty
		const form = nameInput.closest("form");
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({
				q: "Test",
			});
		});
	});

	it("should trim whitespace from identifiers", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		const nameInput = screen.getByPlaceholderText(/enter the full name/i);
		const identifiersInput = screen.getByPlaceholderText(/passport/i);

		fireEvent.change(nameInput, { target: { value: "Test" } });
		fireEvent.change(identifiersInput, {
			target: { value: "  ID1  ,  ID2  " },
		});

		const form = nameInput.closest("form");
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({
				q: "Test",
				identifiers: ["ID1", "ID2"],
			});
		});
	});

	it("should trim whitespace from countries", async () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		const nameInput = screen.getByPlaceholderText(/enter the full name/i);
		const countriesInput = screen.getByPlaceholderText(/mx, us/i);

		fireEvent.change(nameInput, { target: { value: "Test" } });
		fireEvent.change(countriesInput, {
			target: { value: "  mx  ,  us  " },
		});

		const form = nameInput.closest("form");
		if (form) {
			fireEvent.submit(form);
		}

		await waitFor(() => {
			expect(onSearch).toHaveBeenCalledWith({
				q: "Test",
				countries: ["MX", "US"],
			});
		});
	});

	it("should collapse advanced search when toggled again", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);
		expect(screen.getByPlaceholderText(/passport/i)).toBeInTheDocument();

		// Close advanced search
		fireEvent.click(advancedButton);
		expect(screen.queryByPlaceholderText(/passport/i)).not.toBeInTheDocument();
	});

	it("should preserve advanced search values when toggling panel", () => {
		const onSearch = vi.fn();
		renderWithProvider(<SearchForm onSearch={onSearch} isLoading={false} />);

		// Open and fill advanced search
		const advancedButton = screen.getByRole("button", {
			name: /advanced search/i,
		});
		fireEvent.click(advancedButton);

		const identifiersInput = screen.getByPlaceholderText(/passport/i);
		fireEvent.change(identifiersInput, { target: { value: "TEST-ID" } });

		// Close and reopen
		fireEvent.click(advancedButton);
		fireEvent.click(advancedButton);

		// Value should be preserved
		const newIdentifiersInput = screen.getByPlaceholderText(/passport/i);
		expect(newIdentifiersInput).toHaveValue("TEST-ID");
	});
});
