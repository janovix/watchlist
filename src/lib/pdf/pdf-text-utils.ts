/**
 * URL / hostname helpers shared by PDF export and UI link handling.
 * Kept framework-agnostic for unit testing.
 */

const BARE_DOMAIN_RE = /^[\w-]+(\.[\w-]+)+(\/.*)?\s*$/;

/** Detects full URLs (`https://…`) and bare domains (`mx.linkedin.com`). */
export function looksLikeUrl(value: string): boolean {
	return /^https?:\/\//i.test(value) || BARE_DOMAIN_RE.test(value);
}

/** Ensures the string has an `https://` prefix so it can be used as an href. */
export function ensureProtocol(value: string): string {
	return /^https?:\/\//i.test(value) ? value : `https://${value.trim()}`;
}

/** Extracts hostname from a URL or bare domain string. */
export function extractHostname(value: string): string {
	try {
		return new URL(ensureProtocol(value)).hostname;
	} catch {
		return value;
	}
}
