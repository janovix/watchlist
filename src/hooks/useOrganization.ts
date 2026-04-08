"use client";

import { useState, useEffect } from "react";
import { getAuthCoreBaseUrl } from "@/lib/auth/config";
import { useAuthSession } from "@/lib/auth/useAuthSession";

interface OrganizationInfo {
	name: string;
	logo: string | null;
	role: string | null;
}

/**
 * Resolves the active organization (session `activeOrganizationId`) from the org list.
 */
export function useOrganization(): {
	org: OrganizationInfo | null;
	isLoading: boolean;
} {
	const { data: session, isPending: sessionPending } = useAuthSession();
	const activeOrgId =
		(session?.session as { activeOrganizationId?: string | null } | undefined)
			?.activeOrganizationId ?? null;

	const [org, setOrg] = useState<OrganizationInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (sessionPending) {
			return;
		}

		let cancelled = false;

		void (async () => {
			setIsLoading(true);
			try {
				const response = await fetch(
					`${getAuthCoreBaseUrl()}/api/organization/list-with-role`,
					{ credentials: "include" },
				);
				if (cancelled) return;

				if (!response.ok) {
					setOrg(null);
					return;
				}

				const payload = (await response.json()) as {
					success: boolean;
					data: Array<{
						id: string;
						name: string;
						logo?: string | null;
						role?: string;
					}>;
				} | null;

				const orgs = payload?.data ?? [];
				if (orgs.length === 0) {
					setOrg(null);
					return;
				}

				const picked =
					activeOrgId != null
						? (orgs.find((o) => o.id === activeOrgId) ?? orgs[0])
						: orgs[0];

				const info: OrganizationInfo = {
					name: picked.name,
					logo: picked.logo ?? null,
					role: picked.role ?? null,
				};

				setOrg(info);
			} catch (error) {
				console.warn("[useOrganization] Failed to fetch organization:", error);
				setOrg(null);
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [sessionPending, activeOrgId]);

	return { org, isLoading };
}
