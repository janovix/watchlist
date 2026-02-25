import { requireEnv } from "@/lib/env";

export function getPrivacyUrl(): string {
	return requireEnv(
		"NEXT_PUBLIC_PRIVACY_URL",
		process.env.NEXT_PUBLIC_PRIVACY_URL,
	);
}

export function getTermsUrl(): string {
	return requireEnv("NEXT_PUBLIC_TERMS_URL", process.env.NEXT_PUBLIC_TERMS_URL);
}

export function getHomepageUrl(): string {
	return requireEnv(
		"NEXT_PUBLIC_HOMEPAGE_URL",
		process.env.NEXT_PUBLIC_HOMEPAGE_URL,
	);
}
