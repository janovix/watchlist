import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof Checkbox> = {
	title: "UI/Checkbox",
	component: Checkbox,
	parameters: {
		docs: {
			description: {
				component:
					"A checkbox input component built on Radix UI. Supports controlled and uncontrolled states, and can be used standalone or with a label.",
			},
		},
	},
	tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
	args: {
		checked: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Checkbox in unchecked state.",
			},
		},
	},
};

export const Checked: Story = {
	args: {
		checked: true,
	},
	parameters: {
		docs: {
			description: {
				story: "Checkbox in checked state.",
			},
		},
	},
};

export const Controlled: Story = {
	render: () => {
		const [checked, setChecked] = useState(false);
		return (
			<label className="flex items-center gap-2 text-sm">
				<Checkbox
					checked={checked}
					onCheckedChange={() => setChecked((v) => !v)}
				/>
				<span>{checked ? "Checked" : "Unchecked"}</span>
			</label>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"Controlled checkbox example with state management. Click to toggle between checked and unchecked states.",
			},
		},
	},
};
