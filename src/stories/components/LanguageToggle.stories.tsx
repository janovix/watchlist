import type { Meta, StoryObj } from "@storybook/react";
import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof LanguageToggle> = {
	title: "Components/LanguageToggle",
	component: LanguageToggle,
	parameters: {
		docs: {
			description: {
				component:
					"A language toggle button that allows users to switch between available languages (Spanish and English). Displays the current language and provides a dropdown to select a different language.",
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<LanguageProvider>
				<Story />
			</LanguageProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LanguageToggle>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Language toggle button showing the current language. Click to open dropdown and switch languages.",
			},
		},
	},
};
