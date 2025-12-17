import type { Meta, StoryObj } from "@storybook/react";
import { UserMenu } from "@/components/user-menu";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof UserMenu> = {
	title: "Components/UserMenu",
	component: UserMenu,
	parameters: {
		docs: {
			description: {
				component:
					"A user menu dropdown component typically displayed in the header. Shows user avatar and provides access to user-related actions and settings. Includes internationalized menu items.",
			},
		},
	},
	tags: ["autodocs"],
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

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"User menu button with avatar. Click to open dropdown menu with user options.",
			},
		},
	},
};
