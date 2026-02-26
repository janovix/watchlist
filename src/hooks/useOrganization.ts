"use client";

import { useState, useEffect } from "react";
import { getAuthCoreBaseUrl } from "@/lib/auth/config";

interface OrganizationInfo {
	name: string;
	logo: string | null;
	role: string | null;
}

let cachedOrg: OrganizationInfo | null = null;

export function useOrganization(): {
	org: OrganizationInfo | null;
	isLoading: boolean;
} {
	const [org, setOrg] = useState<OrganizationInfo | null>(cachedOrg);
	const [isLoading, setIsLoading] = useState(cachedOrg === null);

	useEffect(() => {
		if (cachedOrg) return;

		let cancelled = false;

		(async () => {
			try {
				const response = await fetch(
					`${getAuthCoreBaseUrl()}/api/organization/list-with-role`,
					{ credentials: "include" },
				);
				if (cancelled) return;

				if (!response.ok) {
					setIsLoading(false);
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

				if (cancelled) return;

				const orgs = payload?.data ?? [];
				if (orgs.length === 0) {
					setIsLoading(false);
					return;
				}

				const activeOrg = orgs[0];
				const info: OrganizationInfo = {
					name: activeOrg.name,
					logo: activeOrg.logo ?? null,
					role: activeOrg.role ?? null,
				};

				cachedOrg = info;
				setOrg(info);
			} catch (error) {
				console.warn("[useOrganization] Failed to fetch organization:", error);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return { org, isLoading };
}
