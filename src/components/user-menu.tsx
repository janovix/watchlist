"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, HelpCircle, Bell, LogOut } from "lucide-react";
import { useLanguage } from "./language-provider";
import { useAuthSession } from "@/lib/auth";
import { logout } from "@/lib/auth/actions";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function UserMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { t } = useLanguage();
	const { data: session } = useAuthSession();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSignOut = async () => {
		setIsOpen(false);
		await logout();
		// logout() handles redirect to NEXT_PUBLIC_AUTH_APP_URL/login
	};

	const menuItems = [
		{
			icon: User,
			label: t("profile"),
			action: () => {
				console.log("Profile clicked");
				setIsOpen(false);
			},
		},
		{
			icon: Settings,
			label: t("settings"),
			action: () => {
				console.log("Settings clicked");
				setIsOpen(false);
			},
		},
		{
			icon: Bell,
			label: t("notifications"),
			action: () => {
				console.log("Notifications clicked");
				setIsOpen(false);
			},
		},
		{
			icon: HelpCircle,
			label: t("help"),
			action: () => {
				console.log("Help clicked");
				setIsOpen(false);
			},
		},
	];

	const user = session?.user;
	const displayName = user?.name || "User";
	const displayEmail = user?.email || "";
	const avatarUrl = user?.image;

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
				aria-label="User menu"
			>
				{avatarUrl ? (
					<img
						src={avatarUrl}
						alt={displayName}
						className="w-full h-full rounded-full object-cover"
					/>
				) : (
					getInitials(displayName)
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
					{/* User info header */}
					<div className="px-4 py-3 border-b border-border bg-muted/30">
						<p className="font-medium text-foreground truncate">
							{displayName}
						</p>
						{displayEmail && (
							<p className="text-sm text-muted-foreground truncate">
								{displayEmail}
							</p>
						)}
					</div>

					{/* Menu items */}
					<div className="py-1">
						{menuItems.map((item, index) => (
							<button
								key={index}
								onClick={item.action}
								className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
							>
								<item.icon className="h-4 w-4 text-muted-foreground" />
								{item.label}
							</button>
						))}
					</div>

					{/* Logout */}
					<div className="border-t border-border py-1">
						<button
							onClick={handleSignOut}
							className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
						>
							<LogOut className="h-4 w-4" />
							{t("logout")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
