import { describe, expect, it, beforeEach } from "vitest";
import {
	sessionStore,
	setSession,
	clearSession,
	setSessionError,
	setSessionPending,
} from "./sessionStore";
import type { Session } from "./types";

describe("sessionStore", () => {
	beforeEach(() => {
		// Reset store before each test
		clearSession();
	});

	it("should initialize with default state", () => {
		const state = sessionStore.get();
		expect(state.data).toBeNull();
		expect(state.error).toBeNull();
		expect(state.isPending).toBe(false);
	});

	it("should set session correctly", () => {
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

		setSession(mockSession);
		const state = sessionStore.get();

		expect(state.data).toEqual(mockSession);
		expect(state.error).toBeNull();
		expect(state.isPending).toBe(false);
	});

	it("should clear session correctly", () => {
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

		setSession(mockSession);
		clearSession();
		const state = sessionStore.get();

		expect(state.data).toBeNull();
		expect(state.error).toBeNull();
		expect(state.isPending).toBe(false);
	});

	it("should set error correctly", () => {
		const error = new Error("Test error");
		setSessionError(error);
		const state = sessionStore.get();

		expect(state.error).toEqual(error);
		expect(state.isPending).toBe(false);
	});

	it("should set pending state correctly", () => {
		setSessionPending(true);
		let state = sessionStore.get();
		expect(state.isPending).toBe(true);

		setSessionPending(false);
		state = sessionStore.get();
		expect(state.isPending).toBe(false);
	});

	it("should preserve existing state when setting error", () => {
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

		setSession(mockSession);
		const error = new Error("Test error");
		setSessionError(error);
		const state = sessionStore.get();

		expect(state.data).toEqual(mockSession);
		expect(state.error).toEqual(error);
		expect(state.isPending).toBe(false);
	});
});
