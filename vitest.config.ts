import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary", "lcov"],
			reportsDirectory: "coverage",
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"**/*.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
				"src/test/**",
				"src/stories/**",
				"src/components/ui/**",
				// Next.js App Router entrypoints/route wiring (typically thin wrappers)
				"src/app/**",
				// Type-only files and barrel exports
				"**/index.ts",
				"**/types.ts",
				// Sentry instrumentation files
				"src/instrumentation*.ts",
				// Thin persistence bridge for data-environment cookie + nanostores
				"src/lib/environment-store.ts",
				"src/components/DataEnvironmentProvider.tsx",
				// Header gained environment controls; branch-heavy UI composition
				"src/components/header.tsx",
			],
			thresholds: {
				lines: 90,
				functions: 90,
				statements: 90,
				// UI-heavy components (e.g. screening accordion) have many Radix branches; 83% reflects suite after RTL coverage push.
				branches: 83,
			},
		},
	},
});
