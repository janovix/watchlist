"use client";

import { ReactNode } from "react";
import { BackgroundWrapper } from "@/components/background-wrapper";
import { Header } from "@/components/header";

export function LayoutContent({ children }: { children: ReactNode }) {
	return (
		<>
			<BackgroundWrapper />
			<Header />
			<div className="relative z-10">{children}</div>
		</>
	);
}
