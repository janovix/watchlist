import type { Meta, StoryObj } from "@storybook/react";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta = {
	title: "Views/Header",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The application header containing the logo, language toggle, theme toggle, and user menu. Sticky header that stays at the top while scrolling. Includes backdrop blur effect and border styling.",
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

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Logo variant="logo" width={102} height={16} />
					</div>
					<div className="flex items-center gap-2">
						<LanguageToggle />
						<ThemeToggle />
						<UserMenu />
					</div>
				</div>
			</div>
		</header>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Default header with logo and navigation controls. Theme-aware and adapts to system preferences.",
			},
		},
	},
};

export const LightTheme: Story = {
	render: () => (
		<div className="bg-background min-h-screen">
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Logo variant="logo" width={102} height={16} forceTheme="light" />
						</div>
						<div className="flex items-center gap-2">
							<LanguageToggle />
							<ThemeToggle />
							<UserMenu />
						</div>
					</div>
				</div>
			</header>
		</div>
	),
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
	render: () => (
		<div className="bg-background min-h-screen dark">
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Logo variant="logo" width={102} height={16} forceTheme="dark" />
						</div>
						<div className="flex items-center gap-2">
							<LanguageToggle />
							<ThemeToggle />
							<UserMenu />
						</div>
					</div>
				</div>
			</header>
		</div>
	),
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
