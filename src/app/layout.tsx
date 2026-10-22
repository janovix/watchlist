import type React from "react";
import type { Metadata, Viewport } from "next";
import { Roboto, Fira_Code, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { RateLimitBlocker } from "@/components/rate-limit-blocker";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
import { getServerSession } from "@/lib/auth/getServerSession";
import { SettingsProvider } from "@/lib/settings";
import { getServerSettings } from "@/lib/settings/getServerSettings";
import { LanguageProvider } from "@/components/language-provider";
import { SubscriptionProvider } from "@/lib/subscription";
import { LayoutContent } from "@/components/layout-content";
import "./globals.css";

const _roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const _firaCode = Fira_Code({ subsets: ["latin"] });
const _playfair = Playfair_Display({ subsets: ["latin"] });

// Icons, manifest, viewport: keep in sync with aml/src/app/layout.tsx
export const metadata: Metadata = {
	title: "Janovix Watchlist",
	description:
		"Sistema de verificación PEP para compliance y debida diligencia",
	manifest: "/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [
			{
				url: "/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	},
};

export const viewport: Viewport = {
	themeColor: "#0f766e",
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	viewportFit: "cover",
	interactiveWidget: "resizes-content",
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
	const htmlLang = settings.language === "en" ? "en" : "es";

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<head>
				{/* Polyfill for esbuild's __name helper used by next-themes */}
				<script
					dangerouslySetInnerHTML={{
						__html: `if(typeof __name==="undefined"){window.__name=function(e){return e}}`,
					}}
				/>
			</head>
			<body className="font-sans antialiased">
				<SettingsProvider serverSettings={settings}>
					<LanguageProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme={settings.theme}
							enableSystem={settings.theme === "system"}
						>
							<SessionHydrator serverSession={session}>
								<SubscriptionProvider>
									<LayoutContent>{children}</LayoutContent>
								</SubscriptionProvider>
							</SessionHydrator>
							<Toaster />
							<RateLimitBlocker />
						</ThemeProvider>
					</LanguageProvider>
				</SettingsProvider>
			</body>
		</html>
	);
}
