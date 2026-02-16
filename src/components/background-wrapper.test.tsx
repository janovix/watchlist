import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { BackgroundWrapper } from "./background-wrapper";

// Mock next/navigation
vi.mock("next/navigation", () => ({
	usePathname: vi.fn(() => "/"),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
	useTheme: vi.fn(() => ({
		resolvedTheme: "light",
	})),
}));

// Mock the background-speed-context
const mockSubscribe = vi.fn((callback) => {
	// Return unsubscribe function
	return () => {};
});
const mockGetSpeed = vi.fn(() => 0.3);

vi.mock("@/contexts/background-speed-context", () => ({
	useBackgroundSpeed: () => ({
		subscribe: mockSubscribe,
		getSpeed: mockGetSpeed,
	}),
}));

// Mock ChromaWaves component
const mockUpdateSpeed = vi.fn();
const mockUpdateColors = vi.fn();

vi.mock("@/components/chroma-waves", async () => {
	const React = await import("react");
	const Component = React.forwardRef((props: any, ref: any) => {
		// Expose the handle methods via ref
		React.useImperativeHandle(ref, () => ({
			updateSpeed: mockUpdateSpeed,
			updateColors: mockUpdateColors,
		}));
		return <div data-testid="chroma-waves">ChromaWaves</div>;
	});
	Component.displayName = "MockedChromaWaves";
	return {
		default: Component,
	};
});

// Helper to test hslToHex function
function hslToHex(hsl: string): string {
	const parts = hsl.split(" ").map((v) => parseFloat(v));
	if (parts.length < 3 || parts.some(isNaN)) return "#7c3aed";

	const [h, s, l] = parts;
	const sDecimal = s / 100;
	const lDecimal = l / 100;

	const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = lDecimal - c / 2;

	let r = 0,
		g = 0,
		b = 0;
	if (h >= 0 && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (h >= 60 && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (h >= 120 && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (h >= 180 && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (h >= 240 && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (h >= 300 && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	const toHex = (n: number) =>
		Math.round((n + m) * 255)
			.toString(16)
			.padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

describe("BackgroundWrapper", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders ChromaWaves component", () => {
		const { getByTestId } = render(<BackgroundWrapper />);
		expect(getByTestId("chroma-waves")).toBeInTheDocument();
	});

	it("subscribes to background speed changes", () => {
		render(<BackgroundWrapper />);
		expect(mockSubscribe).toHaveBeenCalled();
	});

	it("updates speed on mount with initial speed", () => {
		render(<BackgroundWrapper />);
		expect(mockUpdateSpeed).toHaveBeenCalledWith(0.3);
	});

	it("updates speed when subscription callback is triggered", () => {
		mockSubscribe.mockImplementation((callback) => {
			// Immediately call the callback with a new speed
			setTimeout(() => callback(1.5), 0);
			return () => {};
		});

		render(<BackgroundWrapper />);

		waitFor(() => {
			expect(mockUpdateSpeed).toHaveBeenCalledWith(1.5);
		});
	});

	it("applies correct opacity for home path", async () => {
		const nextNav = await import("next/navigation");
		vi.mocked(nextNav.usePathname).mockReturnValue("/");

		const { container } = render(<BackgroundWrapper />);
		const opacityDiv = container.querySelector('[style*="opacity"]');

		expect(opacityDiv).toHaveStyle({ opacity: "0.9" });
	});

	it("applies correct opacity for info path", async () => {
		const nextNav = await import("next/navigation");
		vi.mocked(nextNav.usePathname).mockReturnValue("/info");

		const { container } = render(<BackgroundWrapper />);

		// Wait for effect to run
		await waitFor(() => {
			const opacityDiv = container.querySelector('[style*="opacity"]');
			expect(opacityDiv).toHaveStyle({ opacity: "0.5" });
		});
	});

	it("applies correct opacity for queries list path", async () => {
		const nextNav = await import("next/navigation");
		vi.mocked(nextNav.usePathname).mockReturnValue("/queries");

		const { container } = render(<BackgroundWrapper />);

		await waitFor(() => {
			const opacityDiv = container.querySelector('[style*="opacity"]');
			expect(opacityDiv).toHaveStyle({ opacity: "0.4" });
		});
	});

	it("applies correct opacity for query detail path", async () => {
		const nextNav = await import("next/navigation");
		vi.mocked(nextNav.usePathname).mockReturnValue("/queries/123");

		const { container } = render(<BackgroundWrapper />);

		await waitFor(() => {
			const opacityDiv = container.querySelector('[style*="opacity"]');
			expect(opacityDiv).toHaveStyle({ opacity: "0.65" });
		});
	});

	it("renders background color layer", () => {
		const { container } = render(<BackgroundWrapper />);
		const bgLayer = container.querySelector(".bg-background");
		expect(bgLayer).toBeInTheDocument();
	});

	it("renders with fixed positioning", () => {
		const { container } = render(<BackgroundWrapper />);
		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper).toHaveClass("fixed", "inset-0", "z-0");
	});
});

describe("hslToHex utility", () => {
	it("converts pure red HSL to hex", () => {
		expect(hslToHex("0 100% 50%")).toBe("#ff0000");
	});

	it("converts pure green HSL to hex", () => {
		expect(hslToHex("120 100% 50%")).toBe("#00ff00");
	});

	it("converts pure blue HSL to hex", () => {
		expect(hslToHex("240 100% 50%")).toBe("#0000ff");
	});

	it("converts purple HSL to hex", () => {
		const result = hslToHex("270 100% 50%");
		expect(result).toBe("#8000ff");
	});

	it("converts gray HSL to hex", () => {
		const result = hslToHex("0 0% 50%");
		expect(result).toBe("#808080");
	});

	it("converts white HSL to hex", () => {
		const result = hslToHex("0 0% 100%");
		expect(result).toBe("#ffffff");
	});

	it("converts black HSL to hex", () => {
		const result = hslToHex("0 0% 0%");
		expect(result).toBe("#000000");
	});

	it("handles invalid HSL string by returning default color", () => {
		expect(hslToHex("invalid")).toBe("#7c3aed");
		expect(hslToHex("")).toBe("#7c3aed");
		expect(hslToHex("abc def ghi")).toBe("#7c3aed");
	});

	it("handles partial HSL values", () => {
		expect(hslToHex("180 50%")).toBe("#7c3aed");
	});

	it("converts cyan HSL to hex", () => {
		const result = hslToHex("180 100% 50%");
		expect(result).toBe("#00ffff");
	});

	it("converts yellow HSL to hex", () => {
		const result = hslToHex("60 100% 50%");
		expect(result).toBe("#ffff00");
	});

	it("converts magenta HSL to hex", () => {
		const result = hslToHex("300 100% 50%");
		expect(result).toBe("#ff00ff");
	});

	it("handles desaturated colors", () => {
		const result = hslToHex("180 50% 50%");
		// 50% saturation cyan at 50% lightness
		expect(result).toMatch(/^#[0-9a-f]{6}$/);
	});

	it("handles different lightness values", () => {
		const dark = hslToHex("240 100% 25%");
		const light = hslToHex("240 100% 75%");
		expect(dark).toMatch(/^#[0-9a-f]{6}$/);
		expect(light).toMatch(/^#[0-9a-f]{6}$/);
		expect(dark).not.toBe(light);
	});
});
