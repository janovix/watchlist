import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
	SettingsProvider,
	useSettings,
	useLanguage,
	useTimezone,
} from "./SettingsProvider";
import { DEFAULT_SETTINGS } from "./types";
import type { ResolvedSettings } from "./types";

// Cleanup after each test
beforeEach(() => {
	cleanup();
});

// Test component that uses the settings hooks
function SettingsConsumer() {
	const settings = useSettings();
	const language = useLanguage();
	const timezone = useTimezone();

	return (
		<div>
			<span data-testid="theme">{settings.theme}</span>
			<span data-testid="language">{language}</span>
			<span data-testid="timezone">{timezone}</span>
			<span data-testid="dateFormat">{settings.dateFormat}</span>
		</div>
	);
}

describe("SettingsProvider", () => {
	describe("with server settings", () => {
		it("should provide settings to children", () => {
			const serverSettings: ResolvedSettings = {
				theme: "dark",
				timezone: "America/Mexico_City",
				language: "es",
				dateFormat: "DD/MM/YYYY",
				avatarUrl: "https://example.com/avatar.jpg",
				sources: {
					theme: "user",
					timezone: "user",
					language: "user",
					dateFormat: "user",
				},
			};

			render(
				<SettingsProvider serverSettings={serverSettings}>
					<SettingsConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("theme")).toHaveTextContent("dark");
			expect(screen.getByTestId("language")).toHaveTextContent("es");
			expect(screen.getByTestId("timezone")).toHaveTextContent(
				"America/Mexico_City",
			);
			expect(screen.getByTestId("dateFormat")).toHaveTextContent("DD/MM/YYYY");
		});

		it("should use default settings when serverSettings is null", () => {
			render(
				<SettingsProvider serverSettings={null}>
					<SettingsConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("theme")).toHaveTextContent(
				DEFAULT_SETTINGS.theme,
			);
			expect(screen.getByTestId("language")).toHaveTextContent(
				DEFAULT_SETTINGS.language,
			);
			expect(screen.getByTestId("timezone")).toHaveTextContent(
				DEFAULT_SETTINGS.timezone,
			);
		});
	});

	describe("useSettings hook", () => {
		it("should return defaults when used outside provider", () => {
			render(<SettingsConsumer />);

			expect(screen.getByTestId("theme")).toHaveTextContent(
				DEFAULT_SETTINGS.theme,
			);
			expect(screen.getByTestId("language")).toHaveTextContent(
				DEFAULT_SETTINGS.language,
			);
		});
	});

	describe("useLanguage hook", () => {
		it("should return the current language", () => {
			const serverSettings: ResolvedSettings = {
				...DEFAULT_SETTINGS,
				language: "en",
			};

			render(
				<SettingsProvider serverSettings={serverSettings}>
					<SettingsConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("language")).toHaveTextContent("en");
		});
	});

	describe("useTimezone hook", () => {
		it("should return the current timezone", () => {
			const serverSettings: ResolvedSettings = {
				...DEFAULT_SETTINGS,
				timezone: "Europe/Madrid",
			};

			render(
				<SettingsProvider serverSettings={serverSettings}>
					<SettingsConsumer />
				</SettingsProvider>,
			);

			expect(screen.getByTestId("timezone")).toHaveTextContent("Europe/Madrid");
		});
	});
});
