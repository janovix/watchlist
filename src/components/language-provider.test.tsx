import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import {
	LanguageProvider,
	useLanguage,
} from "./language-provider";
import { detectBrowserLanguage } from "@/lib/translations";

// Test component that uses the hook
function TestComponent() {
	const { language, setLanguage, t } = useLanguage();
	return (
		<div>
			<span data-testid="language">{language}</span>
			<span data-testid="translation">{t("appName")}</span>
			<button onClick={() => setLanguage("en")}>Set English</button>
			<button onClick={() => setLanguage("pt")}>Set Portuguese</button>
			<button onClick={() => setLanguage("es")}>Set Spanish</button>
		</div>
	);
}

describe("LanguageProvider", () => {
	const originalLocalStorage = global.localStorage;
	const originalNavigator = global.navigator;

	beforeEach(() => {
		// Clean up any existing providers
		document.body.innerHTML = "";
		// Mock localStorage
		global.localStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage;

		// Mock navigator
		Object.defineProperty(global, "navigator", {
			value: {
				language: "es-ES",
			},
			writable: true,
			configurable: true,
		});
	});

	afterEach(() => {
		global.localStorage = originalLocalStorage;
		Object.defineProperty(global, "navigator", {
			value: originalNavigator,
			writable: true,
			configurable: true,
		});
		vi.restoreAllMocks();
	});

	it("should provide default language context during SSR", () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		render(
			<LanguageProvider>
				<TestComponent />
			</LanguageProvider>,
		);

		expect(screen.getByTestId("language")).toHaveTextContent("es");
	});

	it("should load language from localStorage if available", async () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn((key) => (key === "language" ? "en" : null)),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		const { container } = render(
			<LanguageProvider>
				<TestComponent />
			</LanguageProvider>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		const languageElement = container.querySelector('[data-testid="language"]');
		expect(languageElement).toHaveTextContent("en");
	});

	it("should detect browser language if localStorage is empty", async () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		Object.defineProperty(global, "navigator", {
			value: {
				language: "pt-BR",
			},
			writable: true,
			configurable: true,
		});

		const { container } = render(
			<LanguageProvider>
				<TestComponent />
			</LanguageProvider>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		const languageElement = container.querySelector('[data-testid="language"]');
		expect(languageElement).toHaveTextContent("pt");
	});

	it("should update language when setLanguage is called", async () => {
		const setItemSpy = vi.fn();
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => null),
			setItem: setItemSpy,
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		const { container } = render(
			<LanguageProvider>
				<TestComponent />
			</LanguageProvider>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		const englishButtons = screen.getAllByText("Set English");
		await act(async () => {
			fireEvent.click(englishButtons[0]);
		});

		const languageElement = container.querySelector('[data-testid="language"]');
		expect(languageElement).toHaveTextContent("en");
		expect(setItemSpy).toHaveBeenCalledWith("language", "en");
	});

	it("should provide translation function", async () => {
		vi.spyOn(global, "localStorage", "get").mockReturnValue({
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0,
		} as unknown as Storage);

		const { container } = render(
			<LanguageProvider>
				<TestComponent />
			</LanguageProvider>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		const translationElement = container.querySelector('[data-testid="translation"]');
		expect(translationElement).toHaveTextContent("isPep");
	});

	it("should throw error when useLanguage is used outside provider", () => {
		// Suppress console.error for this test
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => {
			render(<TestComponent />);
		}).toThrow("useLanguage must be used within a LanguageProvider");

		consoleSpy.mockRestore();
	});
});
