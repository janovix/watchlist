import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeSwitch } from "./type-switch";

// Mock the language provider
vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	}),
}));

describe("TypeSwitch", () => {
	afterEach(() => {
		cleanup();
	});
	describe("Compact variant", () => {
		it("renders compact variant with User and Building2 icons", () => {
			const onCheckedChange = vi.fn();
			const { container } = render(
				<TypeSwitch
					checked={false}
					onCheckedChange={onCheckedChange}
					compact={true}
				/>,
			);

			const button = screen.getByRole("switch");
			expect(button).toBeInTheDocument();

			// Check for icons (lucide-react icons have specific SVG structure)
			const svgs = container.querySelectorAll("svg");
			expect(svgs.length).toBeGreaterThanOrEqual(2); // User and Building2 icons
		});

		it("calls onCheckedChange when clicked in compact mode", async () => {
			const user = userEvent.setup();
			const onCheckedChange = vi.fn();

			render(
				<TypeSwitch
					checked={false}
					onCheckedChange={onCheckedChange}
					compact={true}
				/>,
			);

			const button = screen.getByRole("switch");
			await user.click(button);

			expect(onCheckedChange).toHaveBeenCalledWith(true);
		});

		it("has correct aria-checked attribute in compact mode", () => {
			const onCheckedChange = vi.fn();

			const { rerender } = render(
				<TypeSwitch
					checked={false}
					onCheckedChange={onCheckedChange}
					compact={true}
				/>,
			);

			let button = screen.getByRole("switch");
			expect(button).toHaveAttribute("aria-checked", "false");
			expect(button).toHaveAttribute("aria-label", "Individual");

			rerender(
				<TypeSwitch
					checked={true}
					onCheckedChange={onCheckedChange}
					compact={true}
				/>,
			);

			button = screen.getByRole("switch");
			expect(button).toHaveAttribute("aria-checked", "true");
			expect(button).toHaveAttribute("aria-label", "Company");
		});
	});

	describe("Full variant", () => {
		it("renders full variant with labels", () => {
			const onCheckedChange = vi.fn();
			const { container } = render(
				<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />,
			);

			const button = screen.getByRole("switch");
			expect(button).toBeInTheDocument();

			// Check for text labels
			expect(screen.getByText("Individuals")).toBeInTheDocument();
		});

		it("shows Companies label when checked", () => {
			const onCheckedChange = vi.fn();
			render(<TypeSwitch checked={true} onCheckedChange={onCheckedChange} />);

			expect(screen.getByText("Companies")).toBeInTheDocument();
		});

		it("calls onCheckedChange when clicked in full mode", async () => {
			const user = userEvent.setup();
			const onCheckedChange = vi.fn();

			render(<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />);

			const button = screen.getByRole("switch");
			await user.click(button);

			expect(onCheckedChange).toHaveBeenCalledWith(true);
		});

		it("has correct aria-checked attribute in full mode", () => {
			const onCheckedChange = vi.fn();

			const { rerender } = render(
				<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />,
			);

			let button = screen.getByRole("switch");
			expect(button).toHaveAttribute("aria-checked", "false");
			expect(button).toHaveAttribute("aria-label", "Individual");

			rerender(<TypeSwitch checked={true} onCheckedChange={onCheckedChange} />);

			button = screen.getByRole("switch");
			expect(button).toHaveAttribute("aria-checked", "true");
			expect(button).toHaveAttribute("aria-label", "Company");
		});

		it("renders with custom className", () => {
			const onCheckedChange = vi.fn();
			render(
				<TypeSwitch
					checked={false}
					onCheckedChange={onCheckedChange}
					className="custom-class"
				/>,
			);

			const button = screen.getByRole("switch");
			expect(button).toHaveClass("custom-class");
		});
	});

	describe("Toggle behavior", () => {
		it("toggles from unchecked to checked", async () => {
			const user = userEvent.setup();
			const onCheckedChange = vi.fn();

			render(<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />);

			const button = screen.getByRole("switch");
			await user.click(button);

			expect(onCheckedChange).toHaveBeenCalledWith(true);
			expect(onCheckedChange).toHaveBeenCalledTimes(1);
		});

		it("toggles from checked to unchecked", async () => {
			const user = userEvent.setup();
			const onCheckedChange = vi.fn();

			render(<TypeSwitch checked={true} onCheckedChange={onCheckedChange} />);

			const button = screen.getByRole("switch");
			await user.click(button);

			expect(onCheckedChange).toHaveBeenCalledWith(false);
			expect(onCheckedChange).toHaveBeenCalledTimes(1);
		});
	});

	describe("Accessibility", () => {
		it("has role switch", () => {
			const onCheckedChange = vi.fn();
			render(<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />);

			const button = screen.getByRole("switch");
			expect(button).toHaveAttribute("role", "switch");
		});

		it("has type button to prevent form submission", () => {
			const onCheckedChange = vi.fn();
			render(<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />);

			const button = screen.getByRole("switch");
			expect(button).toHaveAttribute("type", "button");
		});

		it("is keyboard accessible", async () => {
			const user = userEvent.setup();
			const onCheckedChange = vi.fn();

			render(<TypeSwitch checked={false} onCheckedChange={onCheckedChange} />);

			const button = screen.getByRole("switch");
			button.focus();

			// Press Enter
			await user.keyboard("{Enter}");

			expect(onCheckedChange).toHaveBeenCalledWith(true);
		});
	});
});
