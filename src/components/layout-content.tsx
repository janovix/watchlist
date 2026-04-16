"use client";

import { ReactNode } from "react";
import { Header } from "@/components/header";
import { DataEnvironmentProvider } from "@/components/DataEnvironmentProvider";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import {
	NoWatchlistAccess,
	ApproachingUsageLimitBanner,
} from "@/components/subscription";
import { EntitlementAttributionFooter } from "@/components/EntitlementAttributionFooter";

export function LayoutContent({ children }: { children: ReactNode }) {
	const subscription = useSubscriptionSafe();

	return (
		<DataEnvironmentProvider>
			<div className="flex min-h-screen flex-col">
				<Header />
				<div className="isolate flex min-h-0 flex-1 flex-col">
					{subscription?.isLoading ? (
						<NoWatchlistAccess isLoading />
					) : subscription && !hasWatchlistAccess(subscription.subscription) ? (
						<NoWatchlistAccess />
					) : (
						<>
							<div className="px-4 pt-4">
								<ApproachingUsageLimitBanner />
							</div>
							<div className="flex min-h-0 flex-1 flex-col">{children}</div>
							<EntitlementAttributionFooter />
						</>
					)}
				</div>
			</div>
		</DataEnvironmentProvider>
	);
}
