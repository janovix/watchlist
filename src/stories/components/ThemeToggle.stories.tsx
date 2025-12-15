import type { Meta, StoryObj } from "@storybook/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof ThemeToggle> = {
	title: "Components/ThemeToggle",
	component: ThemeToggle,
	decorators: [
		(Story) => (
			<LanguageProvider>
				<Story />
			</LanguageProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {};
