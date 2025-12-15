import type { Meta, StoryObj } from "@storybook/react";
import { UserMenu } from "@/components/user-menu";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof UserMenu> = {
	title: "Components/UserMenu",
	component: UserMenu,
	decorators: [
		(Story) => (
			<LanguageProvider>
				<div className="flex justify-end p-8">
					<Story />
				</div>
			</LanguageProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {};
