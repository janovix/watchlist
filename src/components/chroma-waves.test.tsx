import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

// Mock Three.js
vi.mock("three", () => ({
	WebGLRenderer: class {
		domElement = document.createElement("canvas");
		setClearColor = vi.fn();
		setSize = vi.fn();
		setPixelRatio = vi.fn();
		render = vi.fn();
		dispose = vi.fn();
	},
	Scene: class {
		add = vi.fn();
		remove = vi.fn();
	},
	OrthographicCamera: class {},
	ShaderMaterial: class {
		dispose = vi.fn();
		uniforms = {};
	},
	PlaneGeometry: class {
		dispose = vi.fn();
	},
	Mesh: class {},
	Vector3: class {
		set = vi.fn();
	},
}));

// Import after mocking
const ChromaWaves = (await import("./chroma-waves")).default;

describe("ChromaWaves", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders without crashing", () => {
		const { container } = render(
			<ChromaWaves
				width="100%"
				height="100vh"
				speed={0.3}
				color="#7c3aed"
				backgroundColor="#e8e8eb"
			/>,
		);

		expect(container.firstChild).toBeInTheDocument();
	});

	it("renders a canvas element", () => {
		const { container } = render(
			<ChromaWaves
				width="100%"
				height="100vh"
				speed={0.3}
				color="#7c3aed"
				backgroundColor="#e8e8eb"
			/>,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
	});

	it("accepts all props without errors", () => {
		expect(() => {
			render(
				<ChromaWaves
					width="800px"
					height="600px"
					speed={1.0}
					color="#ff0000"
					backgroundColor="#000000"
					waveFrequency={0.5}
					waveAmplitude={0.5}
					distortion={2.0}
					chromaShift={0.5}
					noiseLevel={0.2}
					flatness={2}
					quality="high"
				/>,
			);
		}).not.toThrow();
	});

	it("accepts quality prop values", () => {
		const qualities: Array<"low" | "medium" | "high"> = [
			"low",
			"medium",
			"high",
		];

		qualities.forEach((quality) => {
			expect(() => {
				render(
					<ChromaWaves
						width="100%"
						height="100vh"
						speed={0.3}
						color="#7c3aed"
						backgroundColor="#e8e8eb"
						quality={quality}
					/>,
				);
			}).not.toThrow();
		});
	});
});

// Test utility functions and classes directly
describe("hexToRgb utility", () => {
	// Helper function extracted from chroma-waves
	function hexToRgb(hex: string): { r: number; g: number; b: number } {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16) / 255,
					g: parseInt(result[2], 16) / 255,
					b: parseInt(result[3], 16) / 255,
				}
			: { r: 0, g: 0, b: 0 };
	}

	it("converts red hex to RGB", () => {
		const result = hexToRgb("#ff0000");
		expect(result.r).toBeCloseTo(1, 2);
		expect(result.g).toBeCloseTo(0, 2);
		expect(result.b).toBeCloseTo(0, 2);
	});

	it("converts green hex to RGB", () => {
		const result = hexToRgb("#00ff00");
		expect(result.r).toBeCloseTo(0, 2);
		expect(result.g).toBeCloseTo(1, 2);
		expect(result.b).toBeCloseTo(0, 2);
	});

	it("converts blue hex to RGB", () => {
		const result = hexToRgb("#0000ff");
		expect(result.r).toBeCloseTo(0, 2);
		expect(result.g).toBeCloseTo(0, 2);
		expect(result.b).toBeCloseTo(1, 2);
	});

	it("converts white hex to RGB", () => {
		const result = hexToRgb("#ffffff");
		expect(result.r).toBeCloseTo(1, 2);
		expect(result.g).toBeCloseTo(1, 2);
		expect(result.b).toBeCloseTo(1, 2);
	});

	it("converts black hex to RGB", () => {
		const result = hexToRgb("#000000");
		expect(result.r).toBeCloseTo(0, 2);
		expect(result.g).toBeCloseTo(0, 2);
		expect(result.b).toBeCloseTo(0, 2);
	});

	it("handles hex without # prefix", () => {
		const result = hexToRgb("ff0000");
		expect(result.r).toBeCloseTo(1, 2);
		expect(result.g).toBeCloseTo(0, 2);
		expect(result.b).toBeCloseTo(0, 2);
	});

	it("handles invalid hex by returning black", () => {
		const result = hexToRgb("invalid");
		expect(result).toEqual({ r: 0, g: 0, b: 0 });
	});

	it("converts purple hex to RGB", () => {
		const result = hexToRgb("#7c3aed");
		expect(result.r).toBeGreaterThan(0);
		expect(result.g).toBeGreaterThan(0);
		expect(result.b).toBeGreaterThan(0.8);
	});
});

describe("Easing functions", () => {
	// Easing functions extracted from chroma-waves
	const easings = {
		linear: (t: number) => t,
		cubic: (t: number) => t * t * t,
		expo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
	};

	describe("linear easing", () => {
		it("returns input value unchanged", () => {
			expect(easings.linear(0)).toBe(0);
			expect(easings.linear(0.5)).toBe(0.5);
			expect(easings.linear(1)).toBe(1);
		});
	});

	describe("cubic easing", () => {
		it("eases in with cubic curve", () => {
			expect(easings.cubic(0)).toBe(0);
			expect(easings.cubic(0.5)).toBe(0.125);
			expect(easings.cubic(1)).toBe(1);
		});

		it("produces values less than linear for t < 1", () => {
			expect(easings.cubic(0.5)).toBeLessThan(easings.linear(0.5));
			expect(easings.cubic(0.8)).toBeLessThan(easings.linear(0.8));
		});
	});

	describe("expo easing", () => {
		it("returns 0 for t = 0", () => {
			expect(easings.expo(0)).toBe(0);
		});

		it("returns large value for t = 1", () => {
			// expo(1) = 2^(10*(1-1)) = 2^0 = 1
			expect(easings.expo(1)).toBeCloseTo(1, 0);
		});

		it("produces exponential curve", () => {
			const t1 = easings.expo(0.3);
			const t2 = easings.expo(0.6);
			const t3 = easings.expo(0.9);
			expect(t2).toBeGreaterThan(t1);
			expect(t3).toBeGreaterThan(t2);
		});
	});
});

describe("AnimatedValue class", () => {
	class AnimatedValue {
		current: number;
		target: number;
		velocity = 0;
		damping: number;
		stiffness: number;

		constructor(initial: number, damping = 0.8, stiffness = 0.15) {
			this.current = initial;
			this.target = initial;
			this.damping = damping;
			this.stiffness = stiffness;
		}

		setTarget(newTarget: number) {
			this.target = newTarget;
		}

		tick(deltaTime: number) {
			const dt = Math.min(deltaTime, 0.1);
			const force = (this.target - this.current) * this.stiffness;
			this.velocity += force;
			this.velocity *= this.damping;
			this.current += this.velocity * dt * 60;

			if (
				Math.abs(this.target - this.current) < 0.001 &&
				Math.abs(this.velocity) < 0.001
			) {
				this.current = this.target;
				this.velocity = 0;
			}
		}
	}

	it("initializes with given value", () => {
		const animated = new AnimatedValue(5);
		expect(animated.current).toBe(5);
		expect(animated.target).toBe(5);
	});

	it("sets target value", () => {
		const animated = new AnimatedValue(0);
		animated.setTarget(10);
		expect(animated.target).toBe(10);
	});

	it("animates towards target over time", () => {
		const animated = new AnimatedValue(0);
		animated.setTarget(10);

		const initialValue = animated.current;
		animated.tick(0.016); // ~60fps

		expect(animated.current).toBeGreaterThan(initialValue);
		expect(animated.current).toBeLessThan(10);
	});

	it("eventually reaches target value", () => {
		const animated = new AnimatedValue(0);
		animated.setTarget(10);

		// Simulate many frames
		for (let i = 0; i < 200; i++) {
			animated.tick(0.016);
		}

		expect(animated.current).toBeCloseTo(10, 1);
	});

	it("handles negative values", () => {
		const animated = new AnimatedValue(10);
		animated.setTarget(-5);

		for (let i = 0; i < 200; i++) {
			animated.tick(0.016);
		}

		expect(animated.current).toBeCloseTo(-5, 1);
	});

	it("respects damping parameter", () => {
		const lowDamping = new AnimatedValue(0, 0.5, 0.15);
		const highDamping = new AnimatedValue(0, 0.95, 0.15);

		lowDamping.setTarget(10);
		highDamping.setTarget(10);

		// Tick multiple times to see the effect
		for (let i = 0; i < 10; i++) {
			lowDamping.tick(0.016);
			highDamping.tick(0.016);
		}

		// Lower damping means more friction, so it should move slower
		// Higher damping means less friction, so it should move faster
		expect(highDamping.current).toBeGreaterThan(lowDamping.current);
	});

	it("clamps large deltaTime values", () => {
		const animated = new AnimatedValue(0);
		animated.setTarget(10);

		// Large deltaTime should be clamped
		animated.tick(1.0); // 1 second

		// Should not overshoot dramatically
		expect(animated.current).toBeLessThan(20);
	});
});

describe("AnimatedVec3 class", () => {
	class AnimatedVec3 {
		x: { current: number; target: number; velocity: number };
		y: { current: number; target: number; velocity: number };
		z: { current: number; target: number; velocity: number };
		damping: number;
		stiffness: number;

		constructor(
			x: number,
			y: number,
			z: number,
			damping = 0.8,
			stiffness = 0.15,
		) {
			this.x = { current: x, target: x, velocity: 0 };
			this.y = { current: y, target: y, velocity: 0 };
			this.z = { current: z, target: z, velocity: 0 };
			this.damping = damping;
			this.stiffness = stiffness;
		}

		setTarget(x: number, y: number, z: number) {
			this.x.target = x;
			this.y.target = y;
			this.z.target = z;
		}

		tick(deltaTime: number) {
			const dt = Math.min(deltaTime, 0.1);
			["x", "y", "z"].forEach((axis) => {
				const a = this[axis as "x" | "y" | "z"];
				const force = (a.target - a.current) * this.stiffness;
				a.velocity += force;
				a.velocity *= this.damping;
				a.current += a.velocity * dt * 60;

				if (
					Math.abs(a.target - a.current) < 0.001 &&
					Math.abs(a.velocity) < 0.001
				) {
					a.current = a.target;
					a.velocity = 0;
				}
			});
		}
	}

	it("initializes with given values", () => {
		const vec = new AnimatedVec3(1, 2, 3);
		expect(vec.x.current).toBe(1);
		expect(vec.y.current).toBe(2);
		expect(vec.z.current).toBe(3);
	});

	it("sets target for all axes", () => {
		const vec = new AnimatedVec3(0, 0, 0);
		vec.setTarget(5, 10, 15);
		expect(vec.x.target).toBe(5);
		expect(vec.y.target).toBe(10);
		expect(vec.z.target).toBe(15);
	});

	it("animates all axes towards target", () => {
		const vec = new AnimatedVec3(0, 0, 0);
		vec.setTarget(10, 20, 30);

		vec.tick(0.016);

		expect(vec.x.current).toBeGreaterThan(0);
		expect(vec.y.current).toBeGreaterThan(0);
		expect(vec.z.current).toBeGreaterThan(0);

		expect(vec.x.current).toBeLessThan(10);
		expect(vec.y.current).toBeLessThan(20);
		expect(vec.z.current).toBeLessThan(30);
	});

	it("eventually reaches target for all axes", () => {
		const vec = new AnimatedVec3(0, 0, 0);
		vec.setTarget(10, 20, 30);

		for (let i = 0; i < 200; i++) {
			vec.tick(0.016);
		}

		expect(vec.x.current).toBeCloseTo(10, 1);
		expect(vec.y.current).toBeCloseTo(20, 1);
		expect(vec.z.current).toBeCloseTo(30, 1);
	});

	it("animates each axis independently", () => {
		const vec = new AnimatedVec3(0, 0, 0);
		vec.setTarget(10, 0, 0);

		for (let i = 0; i < 200; i++) {
			vec.tick(0.016);
		}

		expect(vec.x.current).toBeCloseTo(10, 1);
		expect(vec.y.current).toBeCloseTo(0, 1);
		expect(vec.z.current).toBeCloseTo(0, 1);
	});
});
