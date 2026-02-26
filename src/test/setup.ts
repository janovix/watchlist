import "@testing-library/jest-dom/vitest";

// Set required environment variables for tests
process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
	"https://auth-svc.example.workers.dev";
process.env.NEXT_PUBLIC_AUTH_APP_URL = "https://auth.example.workers.dev";

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof ResizeObserver;
