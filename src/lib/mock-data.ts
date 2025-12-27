export interface PepRecord {
	dataset: string; // e.g., OFAC, UN, EU, or source like "ai", "watchlist", "gk"
	id: string;
	name: string;
	aliases: string[];
	birthDate: string | null;
	countries: string[];
	firstSeen: string | null;
	lastChange: string | null;
	lastSeen: string | null;
	currentPosition: string | null;
}

export interface PEPResult {
	id: string;
	searchName: string;
	isPep: boolean;
	timestamp: Date;
	record: PepRecord | null; // null if not PEP
	confidence: "high" | "medium" | "low" | "requires_verification";
	currentPosition: string | null;
	evidence: string[];
	reasoning: string;
	source: "ai" | "watchlist" | "gk";
}

const mockPEPRecords: PepRecord[] = [
	{
		dataset: "OFAC",
		id: "OFAC-12345",
		name: "Juan Carlos Pérez García",
		aliases: ["J.C. Pérez", "Juan Pérez"],
		birthDate: "1965-03-15",
		countries: ["ES", "MX"],
		firstSeen: "2018-06-01T00:00:00Z",
		lastChange: "2023-11-15T14:30:00Z",
		lastSeen: "2024-01-10T08:00:00Z",
		currentPosition: "Former Minister of Finance",
	},
	{
		dataset: "EU",
		id: "EU-SAL-78901",
		name: "María González Fernández",
		aliases: ["M. González", "María G. Fernández"],
		birthDate: "1972-08-22",
		countries: ["ES", "PT"],
		firstSeen: "2015-03-10T00:00:00Z",
		lastChange: "2022-09-05T10:15:00Z",
		lastSeen: "2024-01-08T12:00:00Z",
		currentPosition: "Deputy Director",
	},
	{
		dataset: "UN",
		id: "UN-SC-45678",
		name: "Roberto Fernández Díaz",
		aliases: ["R. Fernández", "Roberto F. Díaz", "El Ministro"],
		birthDate: "1958-11-30",
		countries: ["ES", "AR", "UY"],
		firstSeen: "2010-01-15T00:00:00Z",
		lastChange: "2024-01-02T16:45:00Z",
		lastSeen: "2024-01-12T09:30:00Z",
		currentPosition: "Ambassador",
	},
	{
		dataset: "OFAC",
		id: "OFAC-99887",
		name: "Carlos Alberto Mendoza",
		aliases: ["C. Mendoza", "Carlos A. Mendoza"],
		birthDate: "1970-05-12",
		countries: ["VE", "CO", "PA"],
		firstSeen: "2019-08-20T00:00:00Z",
		lastChange: "2023-12-01T11:00:00Z",
		lastSeen: "2024-01-11T15:20:00Z",
		currentPosition: null,
	},
];

export function generateMockResult(
	searchName: string,
	queryId?: string,
): Promise<PEPResult> {
	return new Promise((resolve) => {
		const delay = Math.random() * 3000 + 3000;

		setTimeout(() => {
			// 50% chance of being PEP for demo purposes
			const isPep = Math.random() > 0.5;

			if (isPep) {
				const randomIndex = Math.floor(Math.random() * mockPEPRecords.length);
				const record = mockPEPRecords[randomIndex];

				resolve({
					id: queryId || crypto.randomUUID(),
					searchName,
					isPep: true,
					timestamp: new Date(),
					record,
					confidence: "high",
					currentPosition: record.currentPosition,
					evidence: ["Name match", "Date of birth match", "Country match"],
					reasoning: "Strong match found in PEP database",
					source: "watchlist",
				});
			} else {
				resolve({
					id: queryId || crypto.randomUUID(),
					searchName,
					isPep: false,
					timestamp: new Date(),
					record: null,
					confidence: "low",
					currentPosition: null,
					evidence: [],
					reasoning: "No matches found in PEP databases",
					source: "watchlist",
				});
			}
		}, delay);
	});
}
