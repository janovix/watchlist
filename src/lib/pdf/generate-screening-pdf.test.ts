import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateScreeningPdf } from "./generate-screening-pdf";
import type { SearchQuery } from "@/lib/api/queries";
import type {
	OfacMatch,
	UnscMatch,
	Sat69bMatch,
} from "@/lib/api/watchlist-search";
import type { WatchlistFeatures } from "@/lib/api/watchlist-config";

const breakdown = {
	vectorScore: 0.5,
	nameScore: 0.5,
	metaScore: 0.5,
	identifierMatch: false,
};

function ofacMatch(score: number, name = "Match Name"): OfacMatch {
	return {
		score,
		breakdown,
		target: {
			id: "ofac-1",
			partyType: "Individual",
			primaryName: name,
			aliases: null,
			birthDate: null,
			birthPlace: null,
			addresses: null,
			identifiers: null,
			remarks: null,
			sourceList: "SDN",
			createdAt: "",
			updatedAt: "",
		},
	};
}

function unscMatch(score: number): UnscMatch {
	return {
		score,
		breakdown,
		target: {
			id: "un-1",
			partyType: "Individual",
			primaryName: "UN Name",
			aliases: null,
			birthDate: null,
			birthPlace: null,
			gender: null,
			nationalities: null,
			addresses: null,
			identifiers: null,
			designations: null,
			remarks: null,
			unListType: "Al-Qaida",
			referenceNumber: null,
			listedOn: null,
			createdAt: "",
			updatedAt: "",
		},
	};
}

function sat69bMatch(score: number): Sat69bMatch {
	return {
		score,
		breakdown,
		target: {
			id: "sat-1",
			rfc: "XAXX010101000",
			taxpayerName: "RFC Holder",
			taxpayerStatus: "Active",
			presumptionPhase: null,
			rebuttalPhase: null,
			definitivePhase: null,
			favorablePhase: null,
			createdAt: "",
			updatedAt: "",
		},
	};
}

function minimalQuery(overrides: Partial<SearchQuery> = {}): SearchQuery {
	return {
		id: "q-pdf-1",
		organizationId: "o1",
		userId: "u1",
		source: "watchlist_query",
		userDisplay: null,
		query: "PDF TEST SUBJECT",
		entityType: "person",
		birthDate: null,
		countries: null,
		status: "completed",
		ofacStatus: "completed",
		ofacResult: { matches: [], count: 0 },
		ofacCount: 0,
		sat69bStatus: "completed",
		sat69bResult: { matches: [], count: 0 },
		sat69bCount: 0,
		unStatus: "completed",
		unResult: { matches: [], count: 0 },
		unCount: 0,
		pepOfficialStatus: "completed",
		pepOfficialResult: [],
		pepOfficialCount: 0,
		pepAiStatus: "completed",
		pepAiResult: { probability: 0, summary: "none" },
		adverseMediaStatus: "completed",
		adverseMediaResult: { risk_level: "none", findings: "" },
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}

function defaultFeatures(): WatchlistFeatures {
	return { pepSearch: true, pepGrok: true, adverseMedia: true };
}

describe("generateScreeningPdf", () => {
	beforeEach(() => {
		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: false,
				status: 404,
				blob: () => Promise.resolve(new Blob()),
			} as Response),
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("completes without throwing for a minimal completed query", async () => {
		const t = (key: string) => key;

		await expect(
			generateScreeningPdf(
				minimalQuery(),
				{ name: "Test Organization" },
				"en",
				t,
				defaultFeatures(),
			),
		).resolves.toBeUndefined();
	});

	it("runs for Spanish language", async () => {
		const t = (key: string) => key;
		await expect(
			generateScreeningPdf(minimalQuery(), { name: "Org" }, "es", t),
		).resolves.toBeUndefined();
	});

	it("covers metadata columns, logo fetch, list overflow, and screening sections", async () => {
		const t = (key: string) => key;
		const manyOfac = Array.from({ length: 21 }, (_, i) =>
			ofacMatch(0.2 + i * 0.01, `Listed ${i}`),
		);

		global.fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = typeof input === "string" ? input : input.toString();
			if (url.includes("/api/favicon")) {
				const png = new Uint8Array([
					0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
				]);
				return {
					ok: true,
					status: 200,
					blob: () => Promise.resolve(new Blob([png], { type: "image/png" })),
				} as Response;
			}
			if (url.includes("logo.example")) {
				return {
					ok: true,
					status: 200,
					blob: () =>
						Promise.resolve(new Blob(["fake"], { type: "image/png" })),
				} as Response;
			}
			return {
				ok: false,
				status: 404,
				blob: () => Promise.resolve(new Blob()),
			} as Response;
		});

		vi.stubGlobal(
			"createImageBitmap",
			vi.fn(async () => ({
				width: 32,
				height: 32,
				close: () => {},
			})),
		);

		const query = minimalQuery({
			entityType: "person",
			birthDate: "1990-05-15T00:00:00.000Z",
			countries: ["MX", "US"],
			ofacStatus: "completed",
			ofacResult: { matches: manyOfac, count: manyOfac.length },
			unStatus: "failed",
			unResult: { matches: [unscMatch(0.88)], count: 1 },
			sat69bStatus: "pending",
			sat69bResult: { matches: [sat69bMatch(0.42)], count: 1 },
			pepOfficialStatus: "completed",
			pepOfficialResult: [
				{
					id: "p1",
					nombre: "Official PEP",
					informacionPrincipal: { cargo: "Minister" },
				},
			],
			pepAiStatus: "completed",
			pepAiResult: {
				probability: 0.81,
				summary: { es: "Resumen", en: "Summary text" },
				sources: ["https://news.example.com/a", "plain ref"],
			},
			adverseMediaStatus: "completed",
			adverseMediaResult: {
				risk_level: "high",
				findings: { es: "Hallazgos", en: "Findings text" },
				sources: ["https://adverse.example.com/x"],
			},
		});

		await expect(
			generateScreeningPdf(
				query,
				{ name: "Branded Org", logo: "https://logo.example/logo.png" },
				"en",
				t,
				defaultFeatures(),
			),
		).resolves.toBeUndefined();
	});

	it("skips PEP blocks for organizations and uses partial / running labels", async () => {
		const t = (key: string) => key;
		await expect(
			generateScreeningPdf(
				minimalQuery({
					entityType: "organization",
					status: "partial",
					ofacStatus: "running",
					ofacResult: { matches: [ofacMatch(0.9)], count: 1 },
					unStatus: "completed",
					unResult: { matches: [], count: 0 },
					sat69bStatus: "completed",
					sat69bResult: { matches: [], count: 0 },
					pepOfficialStatus: "skipped",
					pepAiStatus: "skipped",
				}),
				{ name: "Corp" },
				"en",
				t,
				defaultFeatures(),
			),
		).resolves.toBeUndefined();
	});

	it("renders adverse media risk levels and optional features off", async () => {
		const t = (key: string) => key;
		await expect(
			generateScreeningPdf(
				minimalQuery({
					adverseMediaStatus: "failed",
					adverseMediaResult: { risk_level: "low", findings: "x" },
				}),
				{ name: "Org" },
				"es",
				t,
				{ pepSearch: false, pepGrok: false, adverseMedia: true },
			),
		).resolves.toBeUndefined();
	});
});
