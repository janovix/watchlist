"use client";

import { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

export function SessionProvider({ children }: { children: ReactNode }) {
	// Better-auth's useSession hook handles the session state automatically
	// We just need to wrap the app with this provider for context
	return <>{children}</>;
}
