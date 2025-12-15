import type { Meta, StoryObj } from "@storybook/react";
import { LanguageToggle } from "@/components/language-toggle";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof LanguageToggle> = {
	title: "Components/LanguageToggle",
	component: LanguageToggle,
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

export const Default: Story = {};
