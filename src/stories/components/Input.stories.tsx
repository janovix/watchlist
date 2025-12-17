import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";

const meta: Meta<typeof Input> = {
	title: "UI/Input",
	component: Input,
	parameters: {
		docs: {
			description: {
				component:
					"A text input component with consistent styling. Supports all standard HTML input attributes and integrates with form libraries.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Text: Story = {
	args: {
		placeholder: "Type something…",
	},
	parameters: {
		docs: {
			description: {
				story: "Text input with placeholder text.",
			},
		},
	},
};

export const WithValue: Story = {
	args: {
		defaultValue: "Hello",
	},
	parameters: {
		docs: {
			description: {
				story: "Text input with a default value pre-filled.",
			},
		},
	},
};
