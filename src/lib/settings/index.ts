// Types
export type {
	Theme,
	DateFormat,
	LanguageCode,
	ResolvedSettings,
} from "./types";
export { DEFAULT_SETTINGS } from "./types";

// Server-side
export { getServerSettings } from "./getServerSettings";

// Client-side
export {
	SettingsProvider,
	useSettings,
	useLanguage,
	useTimezone,
} from "./SettingsProvider";

// Translation hook
export { useTranslation } from "./useTranslation";
