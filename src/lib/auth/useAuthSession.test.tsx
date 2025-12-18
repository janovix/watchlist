import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Session } from "./types";

// Mock nanostores/react
vi.mock("@nanostores/react", () => ({
	useStore: vi.fn((store) => store.get()),
}));

const mockSetSession = vi.fn();
const mockSessionStoreGet = vi.fn();

vi.mock("./sessionStore", () => ({
	sessionStore: {
		get: () => mockSessionStoreGet(),
	},
	setSession: (...args: any[]) => mockSetSession(...args),
}));

import { useAuthSession, SessionHydrator } from "./useAuthSession";

describe("useAuthSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return session data from store", () => {
		const mockSession: Session = {
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {
				id: "session-1",
				userId: "user-1",
				token: "token-123",
				expiresAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		};

		mockSessionStoreGet.mockReturnValue({
			data: mockSession,
			error: null,
			isPending: false,
		});

		// Test hook in a component
		function TestComponent() {
			const { data, error, isPending } = useAuthSession();
			return (
				<div>
					{data ? <div data-testid="user">{data.user.name}</div> : null}
					{error ? <div data-testid="error">{error.message}</div> : null}
					{isPending ? <div data-testid="pending">Loading...</div> : null}
				</div>
			);
		}

		render(<TestComponent />);

		expect(screen.getByTestId("user")).toHaveTextContent("Test User");
	});

	it("should return null session when no data", () => {
		mockSessionStoreGet.mockReturnValue({
			data: null,
			error: null,
			isPending: false,
		});

		function TestComponent() {
			const { data } = useAuthSession();
			return <div>{data ? "Has session" : "No session"}</div>;
		}

		render(<TestComponent />);

		expect(screen.getByText("No session")).toBeInTheDocument();
	});

	it("should return error state", () => {
		mockSessionStoreGet.mockReturnValue({
			data: null,
			error: new Error("Test error"),
			isPending: false,
		});

		function TestComponent() {
			const { error } = useAuthSession();
			return <div>{error ? error.message : "No error"}</div>;
		}

		render(<TestComponent />);

		expect(screen.getByText("Test error")).toBeInTheDocument();
	});

	it("should return pending state", () => {
		mockSessionStoreGet.mockReturnValue({
			data: null,
			error: null,
			isPending: true,
		});

		function TestComponent() {
			const { isPending } = useAuthSession();
			return <div>{isPending ? "Loading..." : "Ready"}</div>;
		}

		render(<TestComponent />);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});
});

describe("SessionHydrator", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock window object
		Object.defineProperty(window, "window", {
			value: {},
			writable: true,
		});
	});

	it("should hydrate session store on mount", () => {
		const mockSession: Session = {
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {
				id: "session-1",
				userId: "user-1",
				token: "token-123",
				expiresAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		};

		render(
			<SessionHydrator serverSession={mockSession}>
				<div>Children</div>
			</SessionHydrator>,
		);

		expect(mockSetSession).toHaveBeenCalledWith(mockSession);
	});

	it("should render children", () => {
		const mockSession: Session = null;

		render(
			<SessionHydrator serverSession={mockSession}>
				<div data-testid="child">Children</div>
			</SessionHydrator>,
		);

		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("should only hydrate once", () => {
		const mockSession: Session = {
			user: {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				image: null,
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {
				id: "session-1",
				userId: "user-1",
				token: "token-123",
				expiresAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		};

		const { rerender } = render(
			<SessionHydrator serverSession={mockSession}>
				<div>Children</div>
			</SessionHydrator>,
		);

		expect(mockSetSession).toHaveBeenCalledTimes(1);

		// Rerender with different session
		rerender(
			<SessionHydrator serverSession={null}>
				<div>Children</div>
			</SessionHydrator>,
		);

		// Should still only be called once
		expect(mockSetSession).toHaveBeenCalledTimes(1);
	});
});
