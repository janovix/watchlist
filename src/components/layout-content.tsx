"use client";

import { ReactNode } from "react";
import { Header } from "@/components/header";

export function LayoutContent({ children }: { children: ReactNode }) {
	return (
		<>
			<Header />
			{children}
		</>
	);
}
