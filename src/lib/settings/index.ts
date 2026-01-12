// Types
export type {
	Theme,
	DateFormat,
	LanguageCode,
	ResolvedSettings,
	UserSettings,
	UpdateUserSettingsInput,
	SettingsApiResponse,
} from "./types";
export { DEFAULT_SETTINGS } from "./types";

// Server-side
export { getServerSettings } from "./getServerSettings";

// Client-side API
export {
	getUserSettings,
	updateUserSettings,
	getResolvedSettings,
} from "./settingsClient";

// Client-side Provider
export {
	SettingsProvider,
	useSettings,
	useLanguage,
	useTimezone,
} from "./SettingsProvider";

// Translation hook
export { useTranslation } from "./useTranslation";
