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
					"The application header containing the icon logo, language toggle, theme toggle, user menu, and organization picker. Sticky header that stays at the top while scrolling.",
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
					"Default header with icon logo, language and theme toggles, organization picker, and user menu. Theme-aware and adapts to system preferences.",
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
