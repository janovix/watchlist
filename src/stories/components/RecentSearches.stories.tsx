import type { Meta, StoryObj } from "@storybook/react";
import { RecentSearches } from "@/components/recent-searches";
import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { PEPResult } from "@/lib/mock-data";

const meta: Meta<typeof RecentSearches> = {
	title: "Components/RecentSearches",
	component: RecentSearches,
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
		onSelectSearch: (result) => console.log("Selected:", result),
	},
};

export const Empty: Story = {
	args: {
		searches: [],
		onSelectSearch: (result) => console.log("Selected:", result),
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
		onSelectSearch: (result) => console.log("Selected:", result),
	},
};
