import type React from "react";
import type { Metadata } from "next";
import { Roboto, Fira_Code, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import "./globals.css";

const _roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const _firaCode = Fira_Code({ subsets: ["latin"] });
const _playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "isPep - PEP Verification by Janovix",
	description:
		"Sistema de verificación PEP para compliance y debida diligencia",
	generator: "v0.app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<SessionProvider>
						{children}
					</SessionProvider>
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
