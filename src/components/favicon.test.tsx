import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Favicon } from "./favicon";

vi.mock("lucide-react", () => ({
	Link2: () => <span data-testid="link2-fallback" />,
}));

describe("Favicon", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders favicon img with google s2 URL for hostname", () => {
		const { container } = render(
			<Favicon url="https://news.example.com/path" />,
		);
		const img = container.querySelector("img");
		expect(img).toBeInTheDocument();
		expect(img?.getAttribute("src")).toContain("favicons");
		expect(img?.getAttribute("src")).toContain(
			encodeURIComponent("news.example.com"),
		);
	});

	it("shows Link2 fallback when image fails to load", () => {
		const { container } = render(<Favicon url="https://example.com" />);
		const img = container.querySelector("img");
		expect(img).toBeTruthy();
		fireEvent.error(img!);
		expect(screen.getByTestId("link2-fallback")).toBeInTheDocument();
		expect(container.querySelector("img")).toBeNull();
	});
});
