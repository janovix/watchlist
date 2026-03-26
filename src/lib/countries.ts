/**
 * ISO 3166-1 alpha-2 country codes and names for the country multi-select.
 * Covers Americas, major European jurisdictions, and other common countries.
 */

export interface CountryOption {
	code: string;
	name: string;
}

/** Sorted by name; includes Americas, EU/EEA, UK, and other common jurisdictions. */
export const COUNTRY_OPTIONS: CountryOption[] = [
	{ code: "AR", name: "Argentina" },
	{ code: "AU", name: "Australia" },
	{ code: "AT", name: "Austria" },
	{ code: "BE", name: "Belgium" },
	{ code: "BR", name: "Brazil" },
	{ code: "CA", name: "Canada" },
	{ code: "CL", name: "Chile" },
	{ code: "CN", name: "China" },
	{ code: "CO", name: "Colombia" },
	{ code: "CR", name: "Costa Rica" },
	{ code: "HR", name: "Croatia" },
	{ code: "CU", name: "Cuba" },
	{ code: "CY", name: "Cyprus" },
	{ code: "CZ", name: "Czech Republic" },
	{ code: "DK", name: "Denmark" },
	{ code: "DO", name: "Dominican Republic" },
	{ code: "EC", name: "Ecuador" },
	{ code: "EG", name: "Egypt" },
	{ code: "SV", name: "El Salvador" },
	{ code: "EE", name: "Estonia" },
	{ code: "FI", name: "Finland" },
	{ code: "FR", name: "France" },
	{ code: "DE", name: "Germany" },
	{ code: "GR", name: "Greece" },
	{ code: "GT", name: "Guatemala" },
	{ code: "HN", name: "Honduras" },
	{ code: "HK", name: "Hong Kong" },
	{ code: "HU", name: "Hungary" },
	{ code: "IS", name: "Iceland" },
	{ code: "IN", name: "India" },
	{ code: "ID", name: "Indonesia" },
	{ code: "IE", name: "Ireland" },
	{ code: "IL", name: "Israel" },
	{ code: "IT", name: "Italy" },
	{ code: "JP", name: "Japan" },
	{ code: "LV", name: "Latvia" },
	{ code: "LT", name: "Lithuania" },
	{ code: "LU", name: "Luxembourg" },
	{ code: "MT", name: "Malta" },
	{ code: "MX", name: "Mexico" },
	{ code: "NL", name: "Netherlands" },
	{ code: "NZ", name: "New Zealand" },
	{ code: "NI", name: "Nicaragua" },
	{ code: "NO", name: "Norway" },
	{ code: "PA", name: "Panama" },
	{ code: "PY", name: "Paraguay" },
	{ code: "PE", name: "Peru" },
	{ code: "PL", name: "Poland" },
	{ code: "PT", name: "Portugal" },
	{ code: "PR", name: "Puerto Rico" },
	{ code: "RO", name: "Romania" },
	{ code: "RU", name: "Russia" },
	{ code: "SA", name: "Saudi Arabia" },
	{ code: "SG", name: "Singapore" },
	{ code: "SK", name: "Slovakia" },
	{ code: "SI", name: "Slovenia" },
	{ code: "ZA", name: "South Africa" },
	{ code: "KR", name: "South Korea" },
	{ code: "ES", name: "Spain" },
	{ code: "SE", name: "Sweden" },
	{ code: "CH", name: "Switzerland" },
	{ code: "TW", name: "Taiwan" },
	{ code: "TH", name: "Thailand" },
	{ code: "TT", name: "Trinidad and Tobago" },
	{ code: "TR", name: "Turkey" },
	{ code: "UA", name: "Ukraine" },
	{ code: "AE", name: "United Arab Emirates" },
	{ code: "GB", name: "United Kingdom" },
	{ code: "US", name: "United States" },
	{ code: "UY", name: "Uruguay" },
	{ code: "VE", name: "Venezuela" },
];

/** Lookup by code for display. */
const BY_CODE = new Map(COUNTRY_OPTIONS.map((c) => [c.code, c]));

export function getCountryByCode(code: string): CountryOption | undefined {
	return BY_CODE.get(code.toUpperCase());
}

export function getCountryName(code: string): string {
	return BY_CODE.get(code.toUpperCase())?.name ?? code;
}
