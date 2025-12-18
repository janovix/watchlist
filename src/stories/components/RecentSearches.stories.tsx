import type { Meta, StoryObj } from "@storybook/react";
import { RecentSearches } from "@/components/recent-searches";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { PEPResult } from "@/lib/mock-data";

const meta: Meta<typeof RecentSearches> = {
	title: "Components/RecentSearches",
	component: RecentSearches,
	parameters: {
		docs: {
			description: {
				component:
					"Displays a list of recent PEP searches. Shows up to 5 recent searches with their status (PEP/Not PEP), timestamp, and allows users to quickly select a previous search. Renders nothing when there are no recent searches.",
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

type Story = StoryObj<typeof RecentSearches>;

const mockSearches: PEPResult[] = [
	{
		id: "1",
		searchName: "Juan Pérez García",
		isPep: true,
		timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
		record: {
			dataset: "OFAC",
			id: "OFAC-12345",
			name: "Juan Carlos Pérez García",
			aliases: [],
			birthDate: null,
			countries: ["ES"],
			firstSeen: null,
			lastChange: null,
			lastSeen: null,
		},
	},
	{
		id: "2",
		searchName: "María González",
		isPep: false,
		timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
		record: null,
	},
	{
		id: "3",
		searchName: "Carlos Mendoza",
		isPep: true,
		timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
		record: {
			dataset: "EU",
			id: "EU-78901",
			name: "Carlos Mendoza",
			aliases: [],
			birthDate: null,
			countries: ["ES"],
			firstSeen: null,
			lastChange: null,
			lastSeen: null,
		},
	},
];

export const Default: Story = {
	args: {
		searches: mockSearches,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Recent searches list with multiple entries showing both PEP and non-PEP results.",
			},
		},
	},
};

export const Empty: Story = {
	args: {
		searches: [],
	},
	parameters: {
		docs: {
			description: {
				story:
					"Empty state - component renders nothing when there are no recent searches.",
			},
		},
	},
};

export const ManySearches: Story = {
	args: {
		searches: [
			...mockSearches,
			{
				id: "4",
				searchName: "Ana Silva",
				isPep: false,
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
				record: null,
			},
			{
				id: "5",
				searchName: "Roberto Fernández",
				isPep: true,
				timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
				record: {
					dataset: "UN",
					id: "UN-45678",
					name: "Roberto Fernández",
					aliases: [],
					birthDate: null,
					countries: ["ES"],
					firstSeen: null,
					lastChange: null,
					lastSeen: null,
				},
			},
		],
	},
	parameters: {
		docs: {
			description: {
				story:
					"Component displays up to 5 recent searches, showing the most recent ones first.",
			},
		},
	},
};
