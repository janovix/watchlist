import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "@/components/logo";
import { ThemeProvider } from "@/components/theme-provider";

const meta: Meta<typeof Logo> = {
	title: "Components/Logo",
	component: Logo,
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
				<div className="p-8 bg-background">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
	parameters: {
		layout: "centered",
	},
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const LogoLight: Story = {
	args: {
		variant: "logo",
		width: 102,
		height: 16,
		forceTheme: "light",
	},
};

export const LogoDark: Story = {
	args: {
		variant: "logo",
		width: 102,
		height: 16,
		forceTheme: "dark",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<div className="p-8 bg-background">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
};

export const IconLight: Story = {
	args: {
		variant: "icon",
		width: 200,
		height: 200,
		forceTheme: "light",
	},
};

export const IconDark: Story = {
	args: {
		variant: "icon",
		width: 200,
		height: 200,
		forceTheme: "dark",
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<div className="p-8 bg-background">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
};

export const LogoAutoTheme: Story = {
	args: {
		variant: "logo",
		width: 102,
		height: 16,
	},
};

export const IconAutoTheme: Story = {
	args: {
		variant: "icon",
		width: 200,
		height: 200,
	},
};

export const LogoSmall: Story = {
	args: {
		variant: "logo",
		width: 76,
		height: 12,
		forceTheme: "light",
	},
};

export const IconSmall: Story = {
	args: {
		variant: "icon",
		width: 64,
		height: 64,
		forceTheme: "light",
	},
};
