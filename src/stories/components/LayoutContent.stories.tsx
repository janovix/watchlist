import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { LayoutContent } from "@/components/layout-content";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import {
	SubscriptionContext,
	type SubscriptionContextValue,
	type SubscriptionStatus,
} from "@/lib/subscription";

function baseSubscription(
	overrides: Partial<SubscriptionStatus> = {},
): SubscriptionStatus {
	return {
		hasSubscription: true,
		status: "active",
		plan: "watchlist",
		limits: null,
		isTrialing: false,
		trialDaysRemaining: null,
		currentPeriodStart: null,
		currentPeriodEnd: null,
		cancelAtPeriodEnd: false,
		isLicenseBased: false,
		licenseExpiresAt: null,
		organizationsOwned: 1,
		organizationsLimit: 10,
		...overrides,
	};
}

function createMockSubscriptionContextValue(
	partial: Partial<SubscriptionContextValue>,
): SubscriptionContextValue {
	const subscription =
		partial.subscription !== undefined
			? partial.subscription
			: baseSubscription();
	const isLoading = partial.isLoading ?? false;
	return {
		subscription,
		isLoading,
		error: partial.error ?? null,
		refresh: partial.refresh ?? (async () => {}),
		isFreeTier: partial.isFreeTier ?? false,
		hasPaidSubscription: partial.hasPaidSubscription ?? true,
		isEnterprise: partial.isEnterprise ?? false,
	};
}

type LayoutContentStoryMetaArgs = {
	childLabel: string;
	children?: ReactNode;
};

const meta: Meta<LayoutContentStoryMetaArgs> = {
	title: "Views/LayoutContent",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"App shell: sticky header plus main area. Shows a loading or no-access blocker based on subscription, otherwise renders children.",
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<LanguageProvider>
					<Story />
				</LanguageProvider>
			</ThemeProvider>
		),
	],
};

export default meta;

type Story = StoryObj<LayoutContentStoryMetaArgs>;

export const Loading: Story = {
	render: () => (
		<SubscriptionContext.Provider
			value={createMockSubscriptionContextValue({
				isLoading: true,
				subscription: null,
				isFreeTier: true,
				hasPaidSubscription: false,
				isEnterprise: false,
			})}
		>
			<LayoutContent>
				<div data-testid="hidden-children">Hidden while loading</div>
			</LayoutContent>
		</SubscriptionContext.Provider>
	),
};

export const NoAccess: Story = {
	render: () => (
		<SubscriptionContext.Provider
			value={createMockSubscriptionContextValue({
				isLoading: false,
				subscription: baseSubscription({
					hasSubscription: true,
					status: "canceled",
				}),
				hasPaidSubscription: false,
			})}
		>
			<LayoutContent>
				<div data-testid="hidden-children">Hidden without access</div>
			</LayoutContent>
		</SubscriptionContext.Provider>
	),
};

export const Default: Story = {
	args: {
		childLabel: "Main content area",
	},
	argTypes: {
		childLabel: {
			control: "text",
			description: "Text shown in the main region when the user has access",
		},
	},
	render: (args) => (
		<SubscriptionContext.Provider
			value={createMockSubscriptionContextValue({
				isLoading: false,
				subscription: baseSubscription({
					hasSubscription: true,
					status: "active",
				}),
			})}
		>
			<LayoutContent>
				<main className="flex flex-1 flex-col p-6 text-muted-foreground">
					{args.childLabel}
				</main>
			</LayoutContent>
		</SubscriptionContext.Provider>
	),
};
