export interface WatchlistFeatures {
	pepSearch: boolean;
	pepGrok: boolean;
	adverseMedia: boolean;
}

interface ConfigResponse {
	success: boolean;
	result: {
		features: WatchlistFeatures;
	};
}

function getWatchlistApiBaseUrl(): string {
	return (
		process.env.NEXT_PUBLIC_WATCHLIST_API_BASE_URL ??
		"https://watchlist-svc.janovix.workers.dev"
	);
}

const DEFAULT_FEATURES: WatchlistFeatures = {
	pepSearch: true,
	pepGrok: true,
	adverseMedia: true,
};

export async function fetchWatchlistConfig(): Promise<WatchlistFeatures> {
	try {
		const baseUrl = getWatchlistApiBaseUrl();
		const res = await fetch(`${baseUrl}/config`);
		if (!res.ok) {
			console.warn(
				`[WatchlistConfig] /config returned ${res.status}, using defaults`,
			);
			return DEFAULT_FEATURES;
		}
		const data: ConfigResponse = await res.json();
		return data.result.features;
	} catch (error) {
		console.warn(
			"[WatchlistConfig] Failed to fetch config, using defaults:",
			error,
		);
		return DEFAULT_FEATURES;
	}
}
