"use client";

import {
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
	memo,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Easing functions
// ---------------------------------------------------------------------------
export type EasingFn = (t: number) => number;

export const easings = {
	linear: ((t: number) => t) as EasingFn,
	easeInCubic: ((t: number) => t * t * t) as EasingFn,
	easeOutCubic: ((t: number) => 1 - Math.pow(1 - t, 3)) as EasingFn,
	easeInOutCubic: ((t: number) =>
		t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) as EasingFn,
	easeOutExpo: ((t: number) =>
		t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) as EasingFn,
};

const DEFAULT_EASING = easings.easeInOutCubic;
const DEFAULT_DURATION = 500; // ms

// ---------------------------------------------------------------------------
// AnimatedValue – lerps a single number inside the RAF loop
// ---------------------------------------------------------------------------
class AnimatedValue {
	current: number;
	private from: number;
	private to: number;
	private duration: number;
	private elapsed: number;
	private easing: EasingFn;
	private active: boolean;

	constructor(initial: number) {
		this.current = initial;
		this.from = initial;
		this.to = initial;
		this.duration = 0;
		this.elapsed = 0;
		this.easing = DEFAULT_EASING;
		this.active = false;
	}

	setTarget(
		target: number,
		duration = DEFAULT_DURATION,
		easing: EasingFn = DEFAULT_EASING,
	) {
		if (duration <= 0) {
			this.current = target;
			this.to = target;
			this.from = target;
			this.active = false;
			return;
		}
		this.from = this.current;
		this.to = target;
		this.duration = duration;
		this.elapsed = 0;
		this.easing = easing;
		this.active = true;
	}

	tick(deltaMs: number): number {
		if (!this.active) return this.current;
		this.elapsed += deltaMs;
		const rawT = Math.min(this.elapsed / this.duration, 1);
		const t = this.easing(rawT);
		this.current = this.from + (this.to - this.from) * t;
		if (rawT >= 1) {
			this.current = this.to;
			this.active = false;
		}
		return this.current;
	}
}

// ---------------------------------------------------------------------------
// AnimatedVec3 – lerps three numbers (for RGB colors)
// ---------------------------------------------------------------------------
class AnimatedVec3 {
	current: [number, number, number];
	private from: [number, number, number];
	private to: [number, number, number];
	private duration: number;
	private elapsed: number;
	private easing: EasingFn;
	private active: boolean;

	constructor(r: number, g: number, b: number) {
		this.current = [r, g, b];
		this.from = [r, g, b];
		this.to = [r, g, b];
		this.duration = 0;
		this.elapsed = 0;
		this.easing = DEFAULT_EASING;
		this.active = false;
	}

	setTarget(
		r: number,
		g: number,
		b: number,
		duration = DEFAULT_DURATION,
		easing: EasingFn = DEFAULT_EASING,
	) {
		if (duration <= 0) {
			this.current = [r, g, b];
			this.to = [r, g, b];
			this.from = [r, g, b];
			this.active = false;
			return;
		}
		this.from = [...this.current];
		this.to = [r, g, b];
		this.duration = duration;
		this.elapsed = 0;
		this.easing = easing;
		this.active = true;
	}

	tick(deltaMs: number): [number, number, number] {
		if (!this.active) return this.current;
		this.elapsed += deltaMs;
		const rawT = Math.min(this.elapsed / this.duration, 1);
		const t = this.easing(rawT);
		this.current = [
			this.from[0] + (this.to[0] - this.from[0]) * t,
			this.from[1] + (this.to[1] - this.from[1]) * t,
			this.from[2] + (this.to[2] - this.from[2]) * t,
		];
		if (rawT >= 1) {
			this.current = [...this.to];
			this.active = false;
		}
		return this.current;
	}
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16) / 255,
				g: parseInt(result[2], 16) / 255,
				b: parseInt(result[3], 16) / 255,
			}
		: { r: 1, g: 1, b: 1 };
}

// ---------------------------------------------------------------------------
// Public handle interface
// ---------------------------------------------------------------------------
export interface ChromaWavesHandle {
	updateSpeed: (speed: number, duration?: number, easing?: EasingFn) => void;
	updateColors: (
		backgroundColor: string,
		color: string,
		duration?: number,
		easing?: EasingFn,
	) => void;
	updateOpacity: (
		opacity: number,
		duration?: number,
		easing?: EasingFn,
	) => void;
}

export interface ChromaWavesProps {
	width?: number | string;
	height?: number | string;
	speed?: number;
	color?: string;
	backgroundColor?: string;
	waveFrequency?: number;
	waveAmplitude?: number;
	distortion?: number;
	chromaShift?: number;
	noiseLevel?: number;
	flatness?: number;
	opacity?: number;
	quality?: "low" | "medium" | "high";
	className?: string;
	children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ChromaWaves = forwardRef<ChromaWavesHandle, ChromaWavesProps>(
	(
		{
			width = "100%",
			height = "100%",
			speed = 0.5,
			color = "#FFFFFF",
			backgroundColor = "#8B5CF6",
			waveFrequency = 0.2,
			waveAmplitude = 0.3,
			distortion = 1.5,
			chromaShift = 0.25,
			noiseLevel = 0.1,
			flatness = 1.0,
			opacity = 1.0,
			quality = "high",
			className,
			children,
		},
		ref,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const rafRef = useRef<number>(0);

		// Animated values live outside React - never trigger re-renders
		const animatedSpeedRef = useRef<AnimatedValue | null>(null);
		const animatedColorRef = useRef<AnimatedVec3 | null>(null);
		const animatedBgColorRef = useRef<AnimatedVec3 | null>(null);
		const animatedOpacityRef = useRef<AnimatedValue | null>(null);

		// Expose imperative methods — bypasses React render cycle entirely
		useImperativeHandle(
			ref,
			() => ({
				updateSpeed: (
					newSpeed: number,
					duration?: number,
					easing?: EasingFn,
				) => {
					animatedSpeedRef.current?.setTarget(newSpeed, duration, easing);
				},
				updateColors: (
					newBg: string,
					newColor: string,
					duration?: number,
					easing?: EasingFn,
				) => {
					const bg = hexToRgb(newBg);
					const col = hexToRgb(newColor);
					animatedColorRef.current?.setTarget(
						col.r,
						col.g,
						col.b,
						duration,
						easing,
					);
					animatedBgColorRef.current?.setTarget(
						bg.r,
						bg.g,
						bg.b,
						duration,
						easing,
					);
				},
				updateOpacity: (
					newOpacity: number,
					duration?: number,
					easing?: EasingFn,
				) => {
					animatedOpacityRef.current?.setTarget(newOpacity, duration, easing);
				},
			}),
			[],
		);

		// Initialize THREE.js scene ONCE — never recreated
		useEffect(() => {
			if (!containerRef.current) return;

			const container = containerRef.current;
			const rect = container.getBoundingClientRect();
			const actualWidth = rect.width;
			const actualHeight = rect.height;

			const renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
				powerPreference: "high-performance",
			});
			renderer.setClearColor(0x000000, 0);

			let qualityMultiplier = 1.0;
			if (quality === "low") qualityMultiplier = 0.5;
			else if (quality === "medium") qualityMultiplier = 0.75;

			const pixelRatio = Math.min(
				window.devicePixelRatio * qualityMultiplier,
				2,
			);
			renderer.setSize(actualWidth, actualHeight, false);
			renderer.setPixelRatio(pixelRatio);
			renderer.domElement.style.width = "100%";
			renderer.domElement.style.height = "100%";
			renderer.domElement.style.display = "block";
			container.appendChild(renderer.domElement);

			const scene = new THREE.Scene();
			const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

			const bufferWidth = actualWidth * pixelRatio;
			const bufferHeight = actualHeight * pixelRatio;

			const initColor = hexToRgb(color);
			const initBg = hexToRgb(backgroundColor);

			const uniforms = {
				iTime: { value: 0 },
				iResolution: {
					value: new THREE.Vector3(bufferWidth, bufferHeight, 1.0),
				},
				uColor: {
					value: new THREE.Vector3(initColor.r, initColor.g, initColor.b),
				},
				uBackgroundColor: {
					value: new THREE.Vector3(initBg.r, initBg.g, initBg.b),
				},
				uWaveFrequency: { value: Math.max(0.1, Math.min(10, waveFrequency)) },
				uWaveAmplitude: { value: Math.max(0.1, Math.min(5, waveAmplitude)) },
				uDistortion: { value: Math.max(0, Math.min(2, distortion)) },
				uChromaShift: { value: Math.max(0, Math.min(0.5, chromaShift)) },
				uNoiseLevel: { value: Math.max(0, Math.min(1, noiseLevel)) },
				uFlatness: { value: Math.max(0, Math.min(10, flatness)) },
				uOpacity: { value: Math.max(0, Math.min(1, opacity)) },
			};

			// Create animated values with initial values matching props
			const animSpeed = new AnimatedValue(speed);
			const animColor = new AnimatedVec3(initColor.r, initColor.g, initColor.b);
			const animBgColor = new AnimatedVec3(initBg.r, initBg.g, initBg.b);
			const animOpacity = new AnimatedValue(opacity);

			animatedSpeedRef.current = animSpeed;
			animatedColorRef.current = animColor;
			animatedBgColorRef.current = animBgColor;
			animatedOpacityRef.current = animOpacity;

			// Shader source
			const vertexShader = `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `;

			const fragmentShader = `
        precision mediump float;

        #define PI 3.1415926538

        uniform float iTime;
        uniform vec3 iResolution;
        uniform vec3 uColor;
        uniform vec3 uBackgroundColor;
        uniform float uWaveFrequency;
        uniform float uWaveAmplitude;
        uniform float uDistortion;
        uniform float uChromaShift;
        uniform float uNoiseLevel;
        uniform float uFlatness;
        uniform float uOpacity;

        vec4 permute(vec4 x) {
          return mod(((x * 34.0) + 1.0) * x, 289.0);
        }

        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
          return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }

        float cnoise(vec3 P) {
          vec3 Pi0 = floor(P);
          vec3 Pi1 = Pi0 + vec3(1.0);
          Pi0 = mod(Pi0, 289.0);
          Pi1 = mod(Pi1, 289.0);
          vec3 Pf0 = fract(P);
          vec3 Pf1 = Pf0 - vec3(1.0);
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 / 7.0;
          vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 / 7.0;
          vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
          vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
          vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
          vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
          vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
          vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
          vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
          vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        float rand(vec2 co) {
          return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 uv = fragCoord / iResolution.xy;
          vec2 center = vec2(0.5);
          vec2 delta = uv - center;
          float dist = length(delta);

          float timeScale = 0.1;
          float timeDelay = uChromaShift * 0.08;
          float baseTime = iTime * timeScale;

          float bSquared = uFlatness * uFlatness;
          float num = 1.0 + bSquared;

          vec3 intensity;

          for (int i = 0; i < 3; i++) {
            float tOffset = float(i) * timeDelay;

            vec2 distortedUV = uv;
            float dx = cnoise(vec3(1.8 * uv, baseTime + tOffset)) * uDistortion;
            distortedUV.x += dx * 0.8;

            vec2 distortedDelta = distortedUV - center;
            float distortedDist = length(distortedDelta);
            float normalizedDist = 1.0 - distortedDist / 0.70710678;

            float x = uWaveFrequency * 100.0 * normalizedDist * uWaveAmplitude;
            float cosX = cos(x);
            float den = 1.0 + bSquared * cosX * cosX;
            float waveValue = sqrt(num / den) * cosX * 0.5 + 0.5;

            if (uNoiseLevel > 0.01) {
              float noise = rand(distortedUV * 1000.0);
              waveValue = waveValue * (1.0 - uNoiseLevel) + noise * uNoiseLevel;
            }

            intensity[i] = waveValue;
          }

          vec3 finalColor = mix(uBackgroundColor, uColor, intensity);
          float alpha = (intensity.r + intensity.g + intensity.b) * 0.333333 * uOpacity;
          fragColor = vec4(finalColor, alpha);
        }

        void main() {
          vec4 color = vec4(0.0);
          mainImage(color, gl_FragCoord.xy);
          gl_FragColor = color;
        }
      `;

			const material = new THREE.ShaderMaterial({
				uniforms,
				vertexShader,
				fragmentShader,
				transparent: true,
			});

			const geometry = new THREE.PlaneGeometry(2, 2);
			const mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);

			// ---- Proper time accumulation ----
			// accumulatedTime only moves forward by delta * speed each frame.
			// Changing speed only affects future frames, never retroactively.
			let accumulatedTime = 0;
			let lastFrameTime = performance.now();

			const animate = (currentTime: number) => {
				rafRef.current = requestAnimationFrame(animate);

				const deltaMs = currentTime - lastFrameTime;
				lastFrameTime = currentTime;

				// Clamp delta to avoid huge jumps (e.g. when tab goes to background)
				const clampedDelta = Math.min(deltaMs, 100);

				// Tick all animated values
				const currentSpeed = animSpeed.tick(clampedDelta);
				const [cr, cg, cb] = animColor.tick(clampedDelta);
				const [br, bg, bb] = animBgColor.tick(clampedDelta);
				const currentOpacity = animOpacity.tick(clampedDelta);

				// Accumulate time using current (possibly interpolating) speed
				accumulatedTime += clampedDelta * 0.001 * currentSpeed;
				uniforms.iTime.value = accumulatedTime;

				// Apply animated colors
				uniforms.uColor.value.set(cr, cg, cb);
				uniforms.uBackgroundColor.value.set(br, bg, bb);
				uniforms.uOpacity.value = currentOpacity;

				renderer.render(scene, camera);
			};

			rafRef.current = requestAnimationFrame(animate);

			const handleResize = () => {
				const newRect = container.getBoundingClientRect();
				const newWidth = newRect.width;
				const newHeight = newRect.height;
				renderer.setSize(newWidth, newHeight, false);
				const newBufferWidth = newWidth * pixelRatio;
				const newBufferHeight = newHeight * pixelRatio;
				uniforms.iResolution.value.set(newBufferWidth, newBufferHeight, 1.0);
			};

			window.addEventListener("resize", handleResize);

			return () => {
				window.removeEventListener("resize", handleResize);
				cancelAnimationFrame(rafRef.current);
				scene.remove(mesh);
				geometry.dispose();
				material.dispose();
				renderer.dispose();
				if (
					renderer.domElement &&
					renderer.domElement.parentNode === container
				) {
					container.removeChild(renderer.domElement);
				}
				animatedSpeedRef.current = null;
				animatedColorRef.current = null;
				animatedBgColorRef.current = null;
				animatedOpacityRef.current = null;
			};
			// Empty dependency array — only create once, never recreate
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		const widthStyle = typeof width === "number" ? `${width}px` : width;
		const heightStyle = typeof height === "number" ? `${height}px` : height;

		return (
			<div
				className={cn("relative overflow-hidden", className)}
				style={{ width: widthStyle, height: heightStyle }}
			>
				<div ref={containerRef} className="absolute inset-0" />
				{children && (
					<div className="relative z-10 w-full h-full pointer-events-none">
						{children}
					</div>
				)}
			</div>
		);
	},
);

ChromaWaves.displayName = "ChromaWaves";

// Wrap in memo — the component should NEVER re-render after initial mount.
// All updates go through the imperative ref handle.
const MemoizedChromaWaves = memo(ChromaWaves);
MemoizedChromaWaves.displayName = "MemoizedChromaWaves";

export default MemoizedChromaWaves;
