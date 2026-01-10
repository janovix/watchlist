import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof Header> = {
	title: "Views/Header",
	component: Header,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The application header containing the icon logo, search input, language toggle, theme toggle, and user menu. Sticky header that stays at the top while scrolling. Includes backdrop blur effect and border styling.",
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

type Story = StoryObj<typeof Header>;

export const Default: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story:
					"Default header with icon logo, search input, and navigation controls. Theme-aware and adapts to system preferences.",
			},
		},
	},
};

export const LightTheme: Story = {
	args: {},
	parameters: {
		docs: {
			description: {
				story:
					"Header in light theme mode. Logo and components are styled for light backgrounds.",
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
				story:
					"Header in dark theme mode. Logo and components are styled for dark backgrounds.",
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
