"use client";

import { ReactNode } from "react";
import { Header } from "@/components/header";

export function LayoutContent({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			{children}
		</div>
	);
}
