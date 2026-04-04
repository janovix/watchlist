"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Settings } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/authClient";
import { getAuthAppUrl } from "@/lib/auth/config";
import { useLanguage } from "@/components/language-provider";

interface OrgData {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	role: string | null;
}

type LoadState = "loading" | "ready" | "hidden";

function getOrgInitials(name: string): string {
	const parts = name.split(" ").filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (
		parts[0].charAt(0).toUpperCase() +
		parts[parts.length - 1].charAt(0).toUpperCase()
	);
}

function CircularProgress({
	value,
	max,
	size = 16,
}: {
	value: number;
	max: number;
	size?: number;
}) {
	const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
	const strokeWidth = 2.5;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	const colorClass =
		percentage >= 100
			? "text-destructive"
			: percentage >= 80
				? "text-yellow-500"
				: "text-primary";

	return (
		<svg
			width={size}
			height={size}
			className={`-rotate-90 ${colorClass}`}
			viewBox={`0 0 ${size} ${size}`}
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				className="opacity-20"
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeDasharray={circumference}
				strokeDashoffset={strokeDashoffset}
				strokeLinecap="round"
			/>
		</svg>
	);
}

function OrgAvatar({
	org,
	size = "md",
}: {
	org: { name: string; logo: string | null };
	size?: "sm" | "md";
}) {
	const cls =
		size === "sm" ? "size-6 rounded-md text-xs" : "size-8 rounded-lg text-sm";
	if (org.logo) {
		return (
			<img src={org.logo} alt={org.name} className={`${cls} object-cover`} />
		);
	}
	return (
		<div
			className={`flex items-center justify-center ${cls} bg-primary text-primary-foreground font-semibold`}
		>
			{getOrgInitials(org.name)}
		</div>
	);
}

export function OrgPicker() {
	const { t } = useLanguage();
	const [organizations, setOrganizations] = useState<OrgData[]>([]);
	const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("loading");
	const [isSwitching, setIsSwitching] = useState(false);
	const [ownedCount, setOwnedCount] = useState(0);

	useEffect(() => {
		let cancelled = false;

		(async () => {
			try {
				const listResult = await authClient.organization.list();
				if (cancelled) return;

				const orgs = listResult.data;
				if (!orgs || orgs.length < 2) {
					setLoadState("hidden");
					return;
				}

				const mapped: OrgData[] = orgs.map((o) => {
					const raw = o as Record<string, unknown>;
					return {
						id: o.id,
						name: o.name,
						slug: o.slug,
						logo: o.logo ?? null,
						role: (raw.role as string) ?? (raw.memberRole as string) ?? null,
					};
				});

				setOrganizations(mapped);
				setOwnedCount(mapped.filter((o) => o.role === "owner").length);

				const session = await authClient.getSession();
				if (cancelled) return;
				const activeId = (session.data?.session as Record<string, unknown>)
					?.activeOrganizationId as string | undefined;
				setActiveOrgId(activeId ?? orgs[0].id);
				setLoadState("ready");
			} catch (error) {
				console.warn("[OrgPicker] Failed to load organizations:", error);
				setLoadState("hidden");
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const handleSwitch = useCallback(
		async (org: OrgData) => {
			if (org.id === activeOrgId || isSwitching) return;
			setIsSwitching(true);

			try {
				await authClient.organization.setActive({
					organizationId: org.id,
				});
				setActiveOrgId(org.id);
				window.location.reload();
			} catch (error) {
				console.error("[OrgPicker] Failed to switch organization:", error);
			} finally {
				setIsSwitching(false);
			}
		},
		[activeOrgId, isSwitching],
	);

	const handleCreateOrg = useCallback(() => {
		const authBaseUrl = getAuthAppUrl();
		window.location.href = `${authBaseUrl}/settings/organization/new`;
	}, []);

	if (loadState === "hidden") return null;

	if (loadState === "loading") {
		return <Skeleton className="size-8 sm:size-9 rounded-lg" />;
	}

	const activeOrg = organizations.find((o) => o.id === activeOrgId);
	const ownedOrgs = organizations.filter((o) => o.role === "owner");
	const memberOrgs = organizations.filter((o) => o.role && o.role !== "owner");
	const hasRoles = ownedOrgs.length > 0 || memberOrgs.length > 0;
	const authAppUrl = getAuthAppUrl();

	return (
		<TooltipProvider delayDuration={200}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						className="flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
						aria-label={t("switchOrganization")}
					>
						{activeOrg ? (
							<OrgAvatar org={activeOrg} />
						) : (
							<div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground text-sm font-semibold">
								?
							</div>
						)}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="min-w-56 rounded-lg"
					align="end"
					sideOffset={6}
				>
					<DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground">
						<span>{t("organizations")}</span>
						<div className="flex items-center gap-1.5">
							<CircularProgress value={ownedCount} max={0} />
							<span className="tabular-nums">{ownedCount}/∞</span>
						</div>
					</DropdownMenuLabel>

					{hasRoles ? (
						<>
							{(ownedOrgs.length > 0 || true) && (
								<DropdownMenuGroup>
									{ownedOrgs.length > 0 && (
										<DropdownMenuLabel className="text-xs text-muted-foreground/70 font-normal px-2 py-1">
											{t("myOrganizations")}
										</DropdownMenuLabel>
									)}
									{ownedOrgs.map((org) => (
										<OrgDropdownItem
											key={org.id}
											org={org}
											onSelect={handleSwitch}
											disabled={isSwitching}
											settingsUrl={`${authAppUrl}/settings/organization?org=${org.slug}`}
											settingsLabel={t("orgSettings")}
										/>
									))}
									<DropdownMenuItem
										className="gap-2 p-2"
										onClick={handleCreateOrg}
									>
										<Plus className="size-4" />
										<span className="text-muted-foreground font-medium">
											{t("createOrganization")}
										</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							)}

							{memberOrgs.length > 0 && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuLabel className="text-xs text-muted-foreground/70 font-normal px-2 py-1">
											{t("memberOf")}
										</DropdownMenuLabel>
										{memberOrgs.map((org) => (
											<OrgDropdownItem
												key={org.id}
												org={org}
												onSelect={handleSwitch}
												disabled={isSwitching}
												settingsUrl={`${authAppUrl}/settings/organization?org=${org.slug}`}
												settingsLabel={t("orgSettings")}
											/>
										))}
									</DropdownMenuGroup>
								</>
							)}
						</>
					) : (
						<>
							{organizations.map((org) => (
								<OrgDropdownItem
									key={org.id}
									org={org}
									onSelect={handleSwitch}
									disabled={isSwitching}
									settingsUrl={`${authAppUrl}/settings/organization?org=${org.slug}`}
									settingsLabel={t("orgSettings")}
								/>
							))}
							<DropdownMenuItem className="gap-2 p-2" onClick={handleCreateOrg}>
								<Plus className="size-4" />
								<span className="text-muted-foreground font-medium">
									{t("createOrganization")}
								</span>
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</TooltipProvider>
	);
}

function OrgDropdownItem({
	org,
	onSelect,
	disabled,
	settingsUrl,
	settingsLabel,
}: {
	org: OrgData;
	onSelect: (org: OrgData) => void;
	disabled: boolean;
	settingsUrl: string;
	settingsLabel: string;
}) {
	return (
		<DropdownMenuItem
			onClick={() => onSelect(org)}
			className="gap-2 p-2"
			disabled={disabled}
		>
			<OrgAvatar org={org} size="sm" />
			<span className="flex-1 truncate">{org.name}</span>
			<Tooltip>
				<TooltipTrigger asChild>
					<a
						href={settingsUrl}
						onClick={(e) => e.stopPropagation()}
						className="p-1 rounded hover:bg-muted"
					>
						<Settings className="size-3.5 text-muted-foreground" />
					</a>
				</TooltipTrigger>
				<TooltipContent side="bottom">{settingsLabel}</TooltipContent>
			</Tooltip>
		</DropdownMenuItem>
	);
}
