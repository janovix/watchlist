import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
	it("should render logo variant by default with Yenio wordmark", () => {
		render(<Logo />);
		expect(screen.getByRole("img", { name: "Yenio" })).toBeInTheDocument();
		expect(screen.getByText("Yenio")).toBeInTheDocument();
		const svg = document.querySelector("svg");
		expect(svg?.getAttribute("viewBox")).toBe("0 0 183 147");
	});

	it("should render icon variant when specified", () => {
		const { container } = render(<Logo variant="icon" />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("viewBox")).toBe("0 0 183 147");
		expect(container.querySelector("span")).toBeNull();
	});

	it("should use custom width and height", () => {
		const { container } = render(
			<Logo variant="icon" width={48} height={40} />,
		);
		const svg = container.querySelector("svg");
		expect(svg?.getAttribute("width")).toBe("48");
		expect(svg?.getAttribute("height")).toBe("40");
	});

	it("should apply className to wrapper", () => {
		const { container } = render(<Logo className="test-class" />);
		expect(container.firstChild).toHaveClass("test-class");
	});

	it("should apply imgClassName to svg", () => {
		const { container } = render(<Logo imgClassName="svg-class" />);
		const svg = container.querySelector("svg");
		expect(svg).toHaveClass("svg-class");
	});
});
