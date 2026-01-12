import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

const meta: Meta<typeof ThemeToggle> = {
	title: "Components/ThemeToggle",
	component: ThemeToggle,
	parameters: {
		docs: {
			description: {
				component:
					"A theme toggle button that allows users to switch between light, dark, and system themes. Displays an icon representing the current theme and provides a dropdown menu to select a different theme preference.",
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

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Theme toggle button showing the current theme. Click to open dropdown and switch between light, dark, or system theme.",
			},
		},
	},
};
