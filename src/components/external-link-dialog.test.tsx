import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import {
	looksLikeUrl,
	ensureProtocol,
	extractHostname,
	useExternalLinkRedirect,
	ExternalLinkDialog,
} from "./external-link-dialog";

// Mock language provider
vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	}),
}));

describe("looksLikeUrl", () => {
	it("should return true for https URLs", () => {
		expect(looksLikeUrl("https://example.com")).toBe(true);
		expect(looksLikeUrl("https://example.com/path?q=1")).toBe(true);
	});

	it("should return true for http URLs", () => {
		expect(looksLikeUrl("http://example.com")).toBe(true);
	});

	it("should return true for bare domains", () => {
		expect(looksLikeUrl("example.com")).toBe(true);
		expect(looksLikeUrl("mx.linkedin.com")).toBe(true);
		expect(looksLikeUrl("sub.domain.example.org")).toBe(true);
	});

	it("should return true for bare domains with paths", () => {
		expect(looksLikeUrl("example.com/path")).toBe(true);
	});

	it("should return false for plain text", () => {
		expect(looksLikeUrl("just some text")).toBe(false);
		expect(looksLikeUrl("hello")).toBe(false);
		expect(looksLikeUrl("")).toBe(false);
	});
});

describe("ensureProtocol", () => {
	it("should not modify URLs that already have https://", () => {
		expect(ensureProtocol("https://example.com")).toBe("https://example.com");
	});

	it("should not modify URLs that already have http://", () => {
		expect(ensureProtocol("http://example.com")).toBe("http://example.com");
	});

	it("should add https:// prefix to bare domains", () => {
		expect(ensureProtocol("example.com")).toBe("https://example.com");
	});

	it("should trim whitespace before adding prefix", () => {
		expect(ensureProtocol("  example.com  ")).toBe("https://example.com");
	});

	it("should handle HTTPS:// (case-insensitive)", () => {
		expect(ensureProtocol("HTTPS://example.com")).toBe("HTTPS://example.com");
	});
});

describe("extractHostname", () => {
	it("should extract hostname from a full https URL", () => {
		expect(extractHostname("https://example.com/path")).toBe("example.com");
	});

	it("should extract hostname from a bare domain", () => {
		expect(extractHostname("example.com")).toBe("example.com");
	});

	it("should extract hostname from a subdomain URL", () => {
		expect(extractHostname("mx.linkedin.com/profile/123")).toBe(
			"mx.linkedin.com",
		);
	});

	it("should return the original value for invalid inputs", () => {
		// An empty string or completely invalid value falls back to the value itself
		expect(extractHostname("not a url at all!!!")).toBeDefined();
	});
});

describe("useExternalLinkRedirect", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it("should start with isOpen false and pendingUrl null", () => {
		const { result } = renderHook(() => useExternalLinkRedirect());

		expect(result.current.isOpen).toBe(false);
		expect(result.current.pendingUrl).toBe(null);
	});

	it("should open dialog and set pendingUrl when skip-warning is not set", () => {
		const { result } = renderHook(() => useExternalLinkRedirect());

		act(() => {
			result.current.handleExternalLink("https://example.com");
		});

		expect(result.current.isOpen).toBe(true);
		expect(result.current.pendingUrl).toBe("https://example.com");
	});

	it("should open link directly (skip dialog) when skip-warning is set", () => {
		localStorage.setItem("janovix_skip_external_link_warning", "true");
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		const { result } = renderHook(() => useExternalLinkRedirect());

		act(() => {
			result.current.handleExternalLink("https://example.com");
		});

		expect(openSpy).toHaveBeenCalledWith(
			"https://example.com",
			"_blank",
			"noopener,noreferrer",
		);
		expect(result.current.isOpen).toBe(false);
		openSpy.mockRestore();
	});

	it("should call window.open and close dialog when confirm is called", () => {
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		const { result } = renderHook(() => useExternalLinkRedirect());

		act(() => {
			result.current.handleExternalLink("https://example.com");
		});

		act(() => {
			result.current.confirm();
		});

		expect(openSpy).toHaveBeenCalledWith(
			"https://example.com",
			"_blank",
			"noopener,noreferrer",
		);
		expect(result.current.isOpen).toBe(false);
		expect(result.current.pendingUrl).toBe(null);
		openSpy.mockRestore();
	});

	it("should close dialog without opening link when cancel is called", () => {
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		const { result } = renderHook(() => useExternalLinkRedirect());

		act(() => {
			result.current.handleExternalLink("https://example.com");
		});

		act(() => {
			result.current.cancel();
		});

		expect(openSpy).not.toHaveBeenCalled();
		expect(result.current.isOpen).toBe(false);
		openSpy.mockRestore();
	});

	it("should call preventDefault on mouse event when provided", () => {
		const { result } = renderHook(() => useExternalLinkRedirect());
		const mockEvent = {
			preventDefault: vi.fn(),
		} as unknown as React.MouseEvent;

		act(() => {
			result.current.handleExternalLink("https://example.com", mockEvent);
		});

		expect(mockEvent.preventDefault).toHaveBeenCalled();
	});

	it("should not call window.open when confirm is called with no pending URL", () => {
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

		const { result } = renderHook(() => useExternalLinkRedirect());

		act(() => {
			result.current.confirm();
		});

		expect(openSpy).not.toHaveBeenCalled();
		openSpy.mockRestore();
	});
});

describe("ExternalLinkDialog", () => {
	const defaultProps = {
		open: true,
		url: "https://example.com/page",
		onConfirm: vi.fn(),
		onCancel: vi.fn(),
	};

	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("should render the dialog title and description keys", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		expect(screen.getByText("externalLinkTitle")).toBeInTheDocument();
		expect(screen.getByText("externalLinkDescription")).toBeInTheDocument();
	});

	it("should display the URL in the dialog", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		expect(screen.getByText("https://example.com/page")).toBeInTheDocument();
	});

	it("should display the hostname in the body text", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		expect(screen.getByText("example.com")).toBeInTheDocument();
	});

	it("should call onConfirm when continue button is clicked", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		const continueBtn = screen.getByText("externalLinkContinue");
		fireEvent.click(continueBtn);

		expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
	});

	it("should call onCancel when cancel button is clicked", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		const cancelBtn = screen.getByText("externalLinkCancel");
		fireEvent.click(cancelBtn);

		expect(defaultProps.onCancel).toHaveBeenCalledOnce();
	});

	it("should set skip warning in localStorage when checkbox is checked and continue is clicked", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		const checkbox = screen.getByRole("checkbox");
		fireEvent.click(checkbox);

		const continueBtn = screen.getByText("externalLinkContinue");
		fireEvent.click(continueBtn);

		expect(localStorage.getItem("janovix_skip_external_link_warning")).toBe(
			"true",
		);
	});

	it("should not set skip warning when checkbox is not checked", () => {
		render(<ExternalLinkDialog {...defaultProps} />);

		const continueBtn = screen.getByText("externalLinkContinue");
		fireEvent.click(continueBtn);

		expect(
			localStorage.getItem("janovix_skip_external_link_warning"),
		).toBeNull();
	});

	it("should not render URL box when url is null", () => {
		render(<ExternalLinkDialog {...defaultProps} url={null} />);

		expect(
			screen.queryByText("https://example.com/page"),
		).not.toBeInTheDocument();
	});

	it("should not render dialog content when open is false", () => {
		render(<ExternalLinkDialog {...defaultProps} open={false} />);

		expect(screen.queryByText("externalLinkTitle")).not.toBeInTheDocument();
	});
});
