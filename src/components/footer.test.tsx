import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { Footer } from "./footer";
import {
	LAYOUT_HORIZONTAL_PAD,
	LAYOUT_INFO_COLUMN,
	LAYOUT_NARROW,
	LAYOUT_OUTER,
} from "@/lib/layout";

const mockPathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
	usePathname: () => mockPathname(),
}));

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("@/lib/config-urls", () => ({
	getHomepageUrl: () => "https://janovix.com",
	getPrivacyUrl: () => "https://janovix.com/privacy",
	getTermsUrl: () => "https://janovix.com/terms",
}));

vi.mock("@/components/logo", () => ({
	Logo: () => <span data-testid="logo" />,
}));

function expectClasses(el: Element | null | undefined, classString: string) {
	expect(el).toBeTruthy();
	const node = el as Element;
	const tokens = classString.trim().split(/\s+/);
	for (const c of tokens) {
		expect(node).toHaveClass(c);
	}
}

describe("Footer", () => {
	beforeEach(() => {
		mockPathname.mockReturnValue("/");
	});

	afterEach(() => {
		cleanup();
	});

	it("uses LAYOUT_OUTER + LAYOUT_NARROW for home (/)", () => {
		mockPathname.mockReturnValue("/");
		const { container } = render(<Footer />);
		const outer = container.querySelector("footer > div");
		expectClasses(outer, `${LAYOUT_OUTER} space-y-4`);
		const inner = outer?.querySelector(":scope > div");
		expectClasses(inner, `${LAYOUT_NARROW} space-y-4`);
	});

	it("uses full-width wrappers for query list (/queries)", () => {
		mockPathname.mockReturnValue("/queries");
		const { container } = render(<Footer />);
		const outer = container.querySelector("footer > div");
		expectClasses(outer, "w-full space-y-4");
		const inner = outer?.querySelector(":scope > div");
		expectClasses(inner, "w-full space-y-4");
	});

	it("uses pad + narrow column for query detail (/queries/:id)", () => {
		mockPathname.mockReturnValue("/queries/abc-123");
		const { container } = render(<Footer />);
		const column = container.querySelector("footer > div");
		expectClasses(
			column,
			`${LAYOUT_HORIZONTAL_PAD} ${LAYOUT_NARROW} space-y-4`,
		);
		expect(container.querySelectorAll("footer > div").length).toBe(1);
	});

	it("uses LAYOUT_OUTER + LAYOUT_INFO_COLUMN for /info", () => {
		mockPathname.mockReturnValue("/info");
		const { container } = render(<Footer />);
		const outer = container.querySelector("footer > div");
		expectClasses(outer, `${LAYOUT_OUTER} space-y-4`);
		const inner = outer?.querySelector(":scope > div");
		expectClasses(inner, `${LAYOUT_INFO_COLUMN} space-y-4`);
	});
});
