import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof Navbar> = {
	title: "Views/Navbar",
	component: Navbar,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The application navbar containing the icon logo and Watchlist link. Sticky navbar that appears below the header. Includes backdrop blur effect and border styling.",
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

type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story:
					"Default navbar with icon logo and Watchlist link. Theme-aware and adapts to system preferences.",
			},
		},
	},
};

export const LightTheme: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: "Navbar in light theme mode.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
				<LanguageProvider>
					<Story />
				</LanguageProvider>
			</ThemeProvider>
		),
	],
};

export const DarkTheme: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story: "Navbar in dark theme mode.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
				<LanguageProvider>
					<div className="dark">
						<Story />
					</div>
				</LanguageProvider>
			</ThemeProvider>
		),
	],
};
