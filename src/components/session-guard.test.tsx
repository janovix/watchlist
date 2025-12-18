import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { SessionGuard } from "./session-guard";

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
	push: mockPush,
	replace: vi.fn(),
	prefetch: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	refresh: vi.fn(),
};

vi.mock("next/navigation", () => ({
	useRouter: () => mockRouter,
	usePathname: () => "/dashboard",
}));

// Mock auth session
const mockUseAuthSession = vi.fn();
vi.mock("@/lib/auth", () => ({
	useAuthSession: () => mockUseAuthSession(),
}));

// Mock authCoreConfig
vi.mock("@/lib/auth/authCoreConfig", () => ({
	getAuthBaseURL: vi.fn(() => "https://auth.example.com"),
}));

describe("SessionGuard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		cleanup();
		// Mock window.location
		Object.defineProperty(window, "location", {
			value: {
				href: "https://example.com/dashboard",
			},
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("should render children when session exists and auth is required", () => {
		mockUseAuthSession.mockReturnValue({
			data: {
				user: { id: "user-1", name: "Test User", email: "test@example.com" },
				session: { id: "session-1", token: "token-123" },
			},
			isPending: false,
		});

		render(
			<SessionGuard requireAuth={true}>
				<div data-testid="content">Protected Content</div>
			</SessionGuard>,
		);

		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("should render children when session exists and auth is not required", () => {
		mockUseAuthSession.mockReturnValue({
			data: null,
			isPending: false,
		});

		const { container } = render(
			<SessionGuard requireAuth={false}>
				<div data-testid="public-content">Public Content</div>
			</SessionGuard>,
		);

		expect(screen.getByTestId("public-content")).toBeInTheDocument();
	});

	it("should redirect when no session and auth is required", async () => {
		mockUseAuthSession.mockReturnValue({
			data: null,
			isPending: false,
		});

		const locationSpy = vi.spyOn(window.location, "href", "set");
		locationSpy.mockImplementation(() => {});

		const { container } = render(
			<SessionGuard requireAuth={true}>
				<div data-testid="protected-content">Protected Content</div>
			</SessionGuard>,
		);

		// Component should not render children when redirecting
		await waitFor(() => {
			expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
		});

		// Verify redirect was attempted
		await waitFor(() => {
			expect(locationSpy).toHaveBeenCalled();
		});

		locationSpy.mockRestore();
	});

	it("should show nothing while session is pending", () => {
		mockUseAuthSession.mockReturnValue({
			data: null,
			isPending: true,
		});

		const { container } = render(
			<SessionGuard requireAuth={true}>
				<div data-testid="pending-content">Protected Content</div>
			</SessionGuard>,
		);

		// Component returns null when pending
		expect(container.textContent).toBe("");
		expect(screen.queryByTestId("pending-content")).not.toBeInTheDocument();
	});

	it("should handle error when getting auth base URL", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		const { getAuthBaseURL } = await import("@/lib/auth/authCoreConfig");
		vi.mocked(getAuthBaseURL).mockImplementation(() => {
			throw new Error("Config error");
		});

		mockUseAuthSession.mockReturnValue({
			data: null,
			isPending: false,
		});

		render(
			<SessionGuard requireAuth={true}>
				<div data-testid="content">Protected Content</div>
			</SessionGuard>,
		);

		await waitFor(() => {
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to get auth base URL:",
				expect.any(Error),
			);
		});

		consoleErrorSpy.mockRestore();
	});
});
