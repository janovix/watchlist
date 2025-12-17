import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
	parameters: {
		docs: {
			description: {
				component:
					"A versatile button component with multiple variants and sizes. Supports all standard button interactions and can be used as a button or as a link using the `asChild` prop.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		children: "Button",
	},
	parameters: {
		docs: {
			description: {
				story: "Default primary button variant with primary color styling.",
			},
		},
	},
};

export const Destructive: Story = {
	args: {
		children: "Delete",
		variant: "destructive",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Destructive button variant for dangerous actions like delete or remove.",
			},
		},
	},
};

export const Outline: Story = {
	args: {
		children: "Outline",
		variant: "outline",
	},
	parameters: {
		docs: {
			description: {
				story: "Outline button variant with border and transparent background.",
			},
		},
	},
};
