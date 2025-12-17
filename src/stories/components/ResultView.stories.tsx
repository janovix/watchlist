import type { Meta, StoryObj } from "@storybook/react";
import { ResultView } from "@/components/result-view";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { PEPResult } from "@/lib/mock-data";

const meta: Meta<typeof ResultView> = {
	title: "Components/ResultView",
	component: ResultView,
	parameters: {
		docs: {
			description: {
				component:
					"Displays the results of a PEP verification search. Shows whether the searched person is a PEP or not, along with detailed record information if they are found in PEP lists. Includes search metadata and a button to start a new search.",
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

type Story = StoryObj<typeof ResultView>;

const pepResult: PEPResult = {
	id: "test-123",
	searchName: "Juan Pérez García",
	isPep: true,
	timestamp: new Date(),
	record: {
		dataset: "OFAC",
		id: "OFAC-12345",
		name: "Juan Carlos Pérez García",
		aliases: ["J.C. Pérez", "Juan Pérez"],
		birthDate: "1965-03-15",
		countries: ["ES", "MX"],
		firstSeen: "2018-06-01T00:00:00Z",
		lastChange: "2023-11-15T14:30:00Z",
		lastSeen: "2024-01-10T08:00:00Z",
	},
};

const nonPepResult: PEPResult = {
	id: "test-456",
	searchName: "María González",
	isPep: false,
	timestamp: new Date(),
	record: null,
};

export const IsPep: Story = {
	args: {
		result: pepResult,
		onNewSearch: () => console.log("New search clicked"),
	},
	parameters: {
		docs: {
			description: {
				story:
					"Result view when the searched person is found in PEP lists. Shows detailed record information including dataset, aliases, birth date, countries, and timestamps.",
			},
		},
	},
};

export const IsNotPep: Story = {
	args: {
		result: nonPepResult,
		onNewSearch: () => console.log("New search clicked"),
	},
	parameters: {
		docs: {
			description: {
				story:
					"Result view when the searched person is not found in any PEP lists. Shows a success message and search metadata.",
			},
		},
	},
};
