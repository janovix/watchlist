import type { Meta, StoryObj } from "@storybook/react";
import { SearchForm } from "@/components/search-form";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

const meta: Meta<typeof SearchForm> = {
	title: "Components/SearchForm",
	component: SearchForm,
	parameters: {
		docs: {
			description: {
				component:
					"A search form component for PEP verification. Includes an input field with user icon and a search button. Supports loading states and internationalization.",
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

type Story = StoryObj<typeof SearchForm>;

export const Default: Story = {
	args: {
		onSearch: (name) => console.log("Search:", name),
		isLoading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Default search form in ready state. User can enter a name and submit the search.",
			},
		},
	},
};

export const Loading: Story = {
	args: {
		onSearch: (name) => console.log("Search:", name),
		isLoading: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Search form in loading state. Input and button are disabled while search is in progress.",
			},
		},
	},
};
