import type { Meta, StoryObj } from "@storybook/react";
import { SearchForm } from "@/components/search-form";
import { LanguageProvider } from "@/components/language-provider";

const meta: Meta<typeof SearchForm> = {
	title: "Components/SearchForm",
	component: SearchForm,
	decorators: [
		(Story) => (
			<LanguageProvider>
				<Story />
			</LanguageProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof SearchForm>;

export const Default: Story = {
	args: {
		onSearch: (name) => console.log("Search:", name),
		isLoading: false,
	},
};

export const Loading: Story = {
	args: {
		onSearch: (name) => console.log("Search:", name),
		isLoading: true,
	},
};
