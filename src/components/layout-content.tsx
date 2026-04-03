"use client";

import { ReactNode } from "react";
import { Header } from "@/components/header";
import { useSubscriptionSafe, hasWatchlistAccess } from "@/lib/subscription";
import {
	NoWatchlistAccess,
	ApproachingUsageLimitBanner,
} from "@/components/subscription";

export function LayoutContent({ children }: { children: ReactNode }) {
	const subscription = useSubscriptionSafe();

	return (
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
						{children}
					</>
				)}
			</div>
		</div>
	);
}
