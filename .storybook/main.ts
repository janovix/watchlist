import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-links", "@storybook/addon-a11y"],
	framework: {
		name: "@storybook/nextjs",
		options: {},
	},
	docs: {
		autodocs: "tag",
	},
	/**
	 * Inject placeholder env vars into webpack's DefinePlugin so that
	 * NEXT_PUBLIC_* references are inlined at compile time. Without this,
	 * @storybook/nextjs reads from .env files (which don't exist in CI/Chromatic)
	 * and the vars remain undefined at runtime in the Storybook iframe.
	 *
	 * Real values can be overridden via process.env (GitHub Actions step env, etc.).
	 */
	env: (existing) => ({
		...existing,
		NEXT_PUBLIC_AUTH_SERVICE_URL:
			process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
			"https://auth-svc.example.workers.dev",
		NEXT_PUBLIC_AUTH_APP_URL:
			process.env.NEXT_PUBLIC_AUTH_APP_URL ||
			"https://auth.example.workers.dev",
		NEXT_PUBLIC_WATCHLIST_API_BASE_URL:
			process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ||
			"https://watchlist-svc.example.workers.dev",
	}),
};

export default config;
