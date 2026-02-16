"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import MemoizedChromaWaves, {
	type ChromaWavesHandle,
} from "@/components/chroma-waves";
import { useBackgroundSpeed } from "@/contexts/background-speed-context";

/**
 * BackgroundWrapper manages the chroma-waves animation background.
 *
 * CRITICAL ARCHITECTURE DECISIONS to prevent animation restarts:
 * 1. Speed is read from context but passed to ChromaWaves via ref (not prop)
 * 2. Colors and opacity are updated via refs and direct DOM manipulation
 * 3. ChromaWaves component is never re-rendered - only mounted once
 * 4. No state that would cause this component to re-render during navigation
 */

// Convert HSL string "H S% L%" to hex
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

function getThemeColors(): { background: string; primary: string } {
	const root = document.documentElement;
	const style = getComputedStyle(root);
	const bgHsl = style.getPropertyValue("--background").trim();
	const primaryHsl = style.getPropertyValue("--primary").trim();
	return {
		background: hslToHex(bgHsl),
		primary: hslToHex(primaryHsl),
	};
}

export function BackgroundWrapper() {
	const { subscribe, getSpeed } = useBackgroundSpeed();
	const pathname = usePathname();
	const { resolvedTheme } = useTheme();

	const chromaRef = useRef<ChromaWavesHandle | null>(null);
	const opacityRef = useRef<HTMLDivElement>(null);

	// Speed subscription
	useEffect(() => {
		chromaRef.current?.updateSpeed(getSpeed());
		const unsubscribe = subscribe((newSpeed) => {
			chromaRef.current?.updateSpeed(newSpeed);
		});
		return unsubscribe;
	}, [subscribe, getSpeed]);

	// Theme color updates
	useEffect(() => {
		if (!resolvedTheme) return;
		const timer = setTimeout(() => {
			try {
				const colors = getThemeColors();
				chromaRef.current?.updateColors(colors.background, colors.primary);
			} catch {}
		}, 50);
		return () => clearTimeout(timer);
	}, [resolvedTheme]);

	// Pathname-based opacity
	const isFirstMount = useRef(true);

	const getOpacityForPath = (path: string) => {
		if (path === "/") return 0.9;
		if (path === "/info") return 0.5;
		if (path === "/queries") return 0.4;
		if (path.startsWith("/queries/")) return 0.65;
		return 0.9;
	};

	useEffect(() => {
		if (!opacityRef.current) return;
		const targetOpacity = getOpacityForPath(pathname);

		if (isFirstMount.current) {
			opacityRef.current.style.transition = "none";
			opacityRef.current.style.opacity = String(targetOpacity);
			isFirstMount.current = false;
			return;
		}

		opacityRef.current.style.transition = "opacity 800ms ease-in-out";
		opacityRef.current.style.opacity = String(targetOpacity);
	}, [pathname]);

	return (
		<div className="fixed inset-0 z-0">
			{/* Solid color background layer */}
			<div className="absolute inset-0 bg-background" />

			{/* ChromaWaves animation layer */}
			<div
				ref={opacityRef}
				className="absolute inset-0"
				style={{ opacity: 0.9 }}
			>
				<MemoizedChromaWaves
					ref={chromaRef}
					width="100%"
					height="100vh"
					speed={0.3}
					color="#7c3aed"
					backgroundColor="#e8e8eb"
					waveFrequency={0.2}
					waveAmplitude={0.3}
					distortion={1.5}
					chromaShift={0.25}
					noiseLevel={0.1}
					flatness={1}
					quality="high"
				/>
			</div>
		</div>
	);
}
