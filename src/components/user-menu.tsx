"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, HelpCircle, Bell, LogOut } from "lucide-react";
import { useLanguage } from "./language-provider";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

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
	const { data: session, isPending } = useSession();

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		await signOut();
		setIsOpen(false);
	};

	const user = session?.user;
	const userName = user?.name || user?.email || "User";
	const userEmail = user?.email || "";
	const userImage = user?.image || null;
	
	// Mock notification count - you can replace this with actual data
	const notificationCount = 3;

	if (isPending) {
		return (
			<div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
		);
	}

	if (!session?.user) {
		return null;
	}

	const menuItems = [
		{
			icon: User,
			label: t("profile"),
			action: () => console.log("Profile clicked"),
		},
		{
			icon: Settings,
			label: t("settings"),
			action: () => console.log("Settings clicked"),
		},
		{
			icon: Bell,
			label: t("notifications"),
			action: () => console.log("Notifications clicked"),
		},
		{
			icon: HelpCircle,
			label: t("help"),
			action: () => console.log("Help clicked"),
		},
	];

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
				aria-label="User menu"
			>
				<Avatar className="w-10 h-10">
					{userImage && (
						<AvatarImage src={userImage} alt={userName} />
					)}
					<AvatarFallback className="bg-primary text-primary-foreground">
						{getInitials(userName)}
					</AvatarFallback>
				</Avatar>
				{notificationCount > 0 && (
					<Badge
						variant="destructive"
						className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold rounded-full"
					>
						{notificationCount}
					</Badge>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
					{/* User info header */}
					<div className="px-4 py-3 border-b border-border bg-muted/30">
						<p className="font-medium text-foreground truncate">
							{userName}
						</p>
						{userEmail && (
							<p className="text-sm text-muted-foreground truncate">
								{userEmail}
							</p>
						)}
					</div>

					{/* Menu items */}
					<div className="py-1">
						{menuItems.map((item, index) => (
							<button
								key={index}
								onClick={() => {
									item.action();
									setIsOpen(false);
								}}
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
							onClick={handleLogout}
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
