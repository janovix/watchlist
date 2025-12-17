import type { Meta, StoryObj } from "@storybook/react";
import { LoadingView } from "@/components/loading-view";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";

const meta: Meta<typeof LoadingView> = {
	title: "Components/LoadingView",
	component: LoadingView,
	parameters: {
		docs: {
			description: {
				component:
					"A loading view displayed during PEP search operations. Shows an animated loading state with the search name being processed. Includes progress indicators and internationalized loading messages.",
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

type Story = StoryObj<typeof LoadingView>;

export const Default: Story = {
	args: {
		searchName: "Juan Pérez García",
	},
	parameters: {
		docs: {
			description: {
				story: "Loading view with a standard length search name.",
			},
		},
	},
};

export const ShortName: Story = {
	args: {
		searchName: "María",
	},
	parameters: {
		docs: {
			description: {
				story: "Loading view with a short search name.",
			},
		},
	},
};

export const LongName: Story = {
	args: {
		searchName: "Juan Carlos Pérez García Fernández",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Loading view with a long search name to test text wrapping and layout.",
			},
		},
	},
};
