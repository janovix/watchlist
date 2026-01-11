import type React from "react";
import type { Metadata } from "next";
import { Roboto, Fira_Code, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
import { getServerSession } from "@/lib/auth/getServerSession";
import { getServerSettings, SettingsProvider } from "@/lib/settings";
import "./globals.css";

const _roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const _firaCode = Fira_Code({ subsets: ["latin"] });
const _playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "isPep - PEP Verification by Janovix",
	description:
		"Sistema de verificación PEP para compliance y debida diligencia",
	generator: "v0.app",
	manifest: "/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	// Fetch session and settings on server for SSR hydration
	const [session, settings] = await Promise.all([
		getServerSession(),
		getServerSettings(),
	]);

	// Use settings for language in HTML lang attribute
	const htmlLang =
		settings.language === "pt"
			? "pt"
			: settings.language === "en"
				? "en"
				: "es";

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<body className="font-sans antialiased">
				<SettingsProvider serverSettings={settings}>
					<ThemeProvider
						attribute="class"
						defaultTheme={settings.theme}
						enableSystem={settings.theme === "system"}
					>
						<SessionHydrator serverSession={session}>
							{children}
						</SessionHydrator>
					</ThemeProvider>
				</SettingsProvider>
				<Analytics />
			</body>
		</html>
	);
}
