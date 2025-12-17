import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "@/components/logo";
import { ThemeProvider } from "@/components/theme-provider";

const meta: Meta<typeof Logo> = {
	title: "Components/Logo",
	component: Logo,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Logo component that displays the application logo or icon. Automatically adapts to light and dark themes. Supports both logo (text) and icon variants with customizable dimensions.",
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
				<div className="p-8 bg-background">
					<Story />
				</div>
			</ThemeProvider>
		),
	],
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
	parameters: {
		docs: {
			description: {
				story:
					"Logo variant forced to light theme colors. Standard header size (102x16).",
			},
		},
	},
};

export const LogoDark: Story = {
	args: {
		variant: "logo",
		width: 102,
		height: 16,
		forceTheme: "dark",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Logo variant forced to dark theme colors. Standard header size (102x16).",
			},
		},
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
	parameters: {
		docs: {
			description: {
				story:
					"Icon variant forced to light theme colors. Large size (200x200) for demonstration.",
			},
		},
	},
};

export const IconDark: Story = {
	args: {
		variant: "icon",
		width: 200,
		height: 200,
		forceTheme: "dark",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Icon variant forced to dark theme colors. Large size (200x200) for demonstration.",
			},
		},
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
	parameters: {
		docs: {
			description: {
				story:
					"Logo variant that automatically adapts to the current theme. Uses system theme preference.",
			},
		},
	},
};

export const IconAutoTheme: Story = {
	args: {
		variant: "icon",
		width: 200,
		height: 200,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Icon variant that automatically adapts to the current theme. Uses system theme preference.",
			},
		},
	},
};

export const LogoSmall: Story = {
	args: {
		variant: "logo",
		width: 76,
		height: 12,
		forceTheme: "light",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Smaller logo variant (76x12) for compact layouts or mobile views.",
			},
		},
	},
};

export const IconSmall: Story = {
	args: {
		variant: "icon",
		width: 64,
		height: 64,
		forceTheme: "light",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Smaller icon variant (64x64) for compact layouts or favicon use.",
			},
		},
	},
};
