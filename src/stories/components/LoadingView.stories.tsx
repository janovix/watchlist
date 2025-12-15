import type { Meta, StoryObj } from "@storybook/react";
import { LoadingView } from "@/components/loading-view";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof LoadingView> = {
	title: "Components/LoadingView",
	component: LoadingView,
	decorators: [
		(Story) => (
			<LanguageProvider>
				<Story />
			</LanguageProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LoadingView>;

export const Default: Story = {
	args: {
		searchName: "Juan Pérez García",
	},
};

export const ShortName: Story = {
	args: {
		searchName: "María",
	},
};

export const LongName: Story = {
	args: {
		searchName: "Juan Carlos Pérez García Fernández",
	},
};
