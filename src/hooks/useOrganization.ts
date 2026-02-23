"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/authClient";

interface OrganizationInfo {
	name: string;
	logo: string | null;
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
				const listResult = await authClient.organization.list();
				if (cancelled) return;

				const orgs = listResult.data;
				if (!orgs || orgs.length === 0) {
					setIsLoading(false);
					return;
				}

				const activeOrg = orgs[0];
				const info: OrganizationInfo = {
					name: activeOrg.name,
					logo: activeOrg.logo ?? null,
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
