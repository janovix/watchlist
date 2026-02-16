"use client";

import {
	createContext,
	useContext,
	useRef,
	useCallback,
	ReactNode,
} from "react";

type SpeedListener = (speed: number) => void;

interface BackgroundSpeedContextType {
	getSpeed: () => number;
	setSpeed: (speed: number) => void;
	isSearching: () => boolean;
	startSearching: () => void;
	stopSearching: () => void;
	subscribe: (listener: SpeedListener) => () => void;
}

const BackgroundSpeedContext = createContext<
	BackgroundSpeedContextType | undefined
>(undefined);

/**
 * BackgroundSpeedProvider uses a ref-based subscription model instead of useState.
 * This means speed changes do NOT trigger React re-renders of the provider or its children.
 * Components that need to react to speed changes subscribe via the subscribe() method.
 */
export function BackgroundSpeedProvider({ children }: { children: ReactNode }) {
	const speedRef = useRef(0.3);
	const searchingRef = useRef(false);
	const listenersRef = useRef<Set<SpeedListener>>(new Set());

	const notify = useCallback((newSpeed: number) => {
		listenersRef.current.forEach((listener) => listener(newSpeed));
	}, []);

	const setSpeed = useCallback(
		(newSpeed: number) => {
			speedRef.current = newSpeed;
			notify(newSpeed);
		},
		[notify],
	);

	const startSearching = useCallback(() => {
		searchingRef.current = true;
		setSpeed(1.5);
	}, [setSpeed]);

	const stopSearching = useCallback(() => {
		searchingRef.current = false;
		setSpeed(0.3);
	}, [setSpeed]);

	const subscribe = useCallback((listener: SpeedListener) => {
		listenersRef.current.add(listener);
		return () => {
			listenersRef.current.delete(listener);
		};
	}, []);

	const getSpeed = useCallback(() => speedRef.current, []);
	const isSearching = useCallback(() => searchingRef.current, []);

	// Value object is stable (all callbacks are memoized), so provider never re-renders children
	const value = useRef<BackgroundSpeedContextType>({
		getSpeed,
		setSpeed,
		isSearching,
		startSearching,
		stopSearching,
		subscribe,
	}).current;

	return (
		<BackgroundSpeedContext.Provider value={value}>
			{children}
		</BackgroundSpeedContext.Provider>
	);
}

export function useBackgroundSpeed() {
	const context = useContext(BackgroundSpeedContext);
	if (context === undefined) {
		throw new Error(
			"useBackgroundSpeed must be used within a BackgroundSpeedProvider",
		);
	}
	return context;
}
