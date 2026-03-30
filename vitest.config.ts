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
			// SSE hooks and real-time components require integration/E2E testing
			"src/hooks/useSearchQuery.ts",
			"src/components/screening-results-card.tsx",
			// PDF generation uses jsPDF canvas rendering — requires integration/E2E testing
			"src/lib/pdf/generate-screening-pdf.ts",
			],
			thresholds: {
				lines: 90,
				functions: 90,
				statements: 90,
				branches: 85,
			},
		},
	},
});
