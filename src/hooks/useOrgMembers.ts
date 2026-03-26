"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/authClient";

export interface MemberInfo {
	name: string;
	image?: string | null;
}

export type MemberMap = Record<string, MemberInfo>;

let cachedMembers: MemberMap | null = null;

export function useOrgMembers(): {
	members: MemberMap;
	isLoading: boolean;
} {
	const [members, setMembers] = useState<MemberMap>(cachedMembers ?? {});
	const [isLoading, setIsLoading] = useState(cachedMembers === null);

	useEffect(() => {
		if (cachedMembers) return;

		let cancelled = false;

		(async () => {
			try {
				const orgsResult = await authClient.organization.list();
				if (cancelled) return;

				const orgs = orgsResult.data;
				if (!orgs || orgs.length === 0) {
					cachedMembers = {};
					setIsLoading(false);
					return;
				}

				const orgId = orgs[0].id;
				const membersResult = await authClient.organization.listMembers({
					query: {
						organizationId: orgId,
						limit: 200,
					},
				});
				if (cancelled) return;

				const map: MemberMap = {};
				const data = membersResult.data;
				if (data && Array.isArray(data)) {
					for (const m of data) {
						if (m.user?.id && m.user?.name) {
							map[m.user.id] = {
								name: m.user.name,
								image: m.user.image ?? null,
							};
						}
					}
				}

				cachedMembers = map;
				setMembers(map);
			} catch (error) {
				console.warn("[useOrgMembers] Failed to fetch members:", error);
				cachedMembers = {};
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	return { members, isLoading };
}
