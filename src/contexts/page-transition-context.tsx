"use client";

import {
	createContext,
	useContext,
	useRef,
	useCallback,
	ReactNode,
} from "react";

type TransitionDirection = "up" | "down" | "none";
type TransitionListener = (direction: TransitionDirection) => void;

interface PageTransitionContextType {
	/** Trigger exit animation, returns a promise that resolves after the animation duration */
	triggerExit: (
		direction: TransitionDirection,
		durationMs?: number,
	) => Promise<void>;
	/** Subscribe to exit events */
	subscribe: (listener: TransitionListener) => () => void;
	/** Get the direction the *next* page should enter from */
	getEnterDirection: () => TransitionDirection;
	/** Set what direction the next page should enter from */
	setEnterDirection: (direction: TransitionDirection) => void;
}

const PageTransitionContext = createContext<
	PageTransitionContextType | undefined
>(undefined);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
	const listenersRef = useRef<Set<TransitionListener>>(new Set());
	const enterDirectionRef = useRef<TransitionDirection>("none");

	const subscribe = useCallback((listener: TransitionListener) => {
		listenersRef.current.add(listener);
		return () => {
			listenersRef.current.delete(listener);
		};
	}, []);

	const triggerExit = useCallback(
		(direction: TransitionDirection, durationMs = 400) => {
			listenersRef.current.forEach((l) => l(direction));
			return new Promise<void>((resolve) => setTimeout(resolve, durationMs));
		},
		[],
	);

	const getEnterDirection = useCallback(() => enterDirectionRef.current, []);
	const setEnterDirection = useCallback((d: TransitionDirection) => {
		enterDirectionRef.current = d;
	}, []);

	const value = useRef<PageTransitionContextType>({
		triggerExit,
		subscribe,
		getEnterDirection,
		setEnterDirection,
	}).current;

	return (
		<PageTransitionContext.Provider value={value}>
			{children}
		</PageTransitionContext.Provider>
	);
}

export function usePageTransition() {
	const context = useContext(PageTransitionContext);
	if (!context)
		throw new Error(
			"usePageTransition must be used within PageTransitionProvider",
		);
	return context;
}
