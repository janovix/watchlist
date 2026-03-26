import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CountryMultiSelect } from "./country-multi-select";

// cmdk uses scrollIntoView; not available in jsdom
beforeEach(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

function getTrigger() {
	const comboboxes = screen.getAllByRole("combobox", { name: /countries/i });
	return comboboxes[0];
}

describe("CountryMultiSelect", () => {
	it("renders with placeholder when value is empty", () => {
		render(
			<CountryMultiSelect
				value={[]}
				onChange={vi.fn()}
				placeholder="Select countries..."
			/>,
		);
		expect(getTrigger()).toHaveTextContent("Select countries...");
	});

	it("renders selected countries as badges when value has codes", () => {
		render(<CountryMultiSelect value={["MX", "US"]} onChange={vi.fn()} />);
		expect(screen.getByText("Mexico (MX)")).toBeInTheDocument();
		expect(screen.getByText("United States (US)")).toBeInTheDocument();
	});

	it("calls onChange with updated array when removing a badge", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<CountryMultiSelect value={["MX", "US"]} onChange={onChange} />);
		const removeButtons = screen.getAllByRole("button", {
			name: /remove mexico/i,
		});
		// Click the last one to target the "current" instance under Strict Mode double-render
		await user.click(removeButtons[removeButtons.length - 1]);
		expect(onChange).toHaveBeenCalledWith(["US"]);
	});

	it("opens listbox and shows countries when trigger is clicked", async () => {
		const user = userEvent.setup();
		render(<CountryMultiSelect value={[]} onChange={vi.fn()} />);
		await user.click(getTrigger());
		const listbox = screen.getByRole("listbox");
		expect(listbox).toBeInTheDocument();
		expect(within(listbox).getByText(/Mexico\s*\(MX\)/)).toBeInTheDocument();
	});

	it("calls onChange with added code when selecting an option", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<CountryMultiSelect value={[]} onChange={onChange} />);
		// Use last trigger so we open the "current" instance under Strict Mode
		const triggers = screen.getAllByRole("combobox", { name: /countries/i });
		await user.click(triggers[triggers.length - 1]);
		const option = await screen.findByRole("option", {
			name: /Mexico\s*\(MX\)/,
		});
		await user.click(option);
		expect(onChange).toHaveBeenCalledWith(["MX"]);
	});

	it("filters options when searching", async () => {
		const user = userEvent.setup();
		render(<CountryMultiSelect value={[]} onChange={vi.fn()} />);
		await user.click(getTrigger());
		const searchInput = screen.getByPlaceholderText("Search countries...");
		await user.type(searchInput, "Mex");
		expect(
			screen.getByRole("option", { name: /Mexico\s*\(MX\)/ }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("option", { name: /United States/ }),
		).not.toBeInTheDocument();
	});
});
