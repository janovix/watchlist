"use client";

import { useState, useRef, useEffect } from "react";
import { User, Settings, HelpCircle, Bell, LogOut } from "lucide-react";
import { useLanguage } from "./language-provider";

// Mock session user
const mockUser = {
	name: "María García",
	email: "maria.garcia@empresa.com",
	avatar: null, // No image, will use initials
	role: "Compliance Officer",
};

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

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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
				className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
				aria-label="User menu"
			>
				{mockUser.avatar ? (
					<img
						src={mockUser.avatar || "/placeholder.svg"}
						alt={mockUser.name}
						className="w-full h-full rounded-full object-cover"
					/>
				) : (
					getInitials(mockUser.name)
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
					{/* User info header */}
					<div className="px-4 py-3 border-b border-border bg-muted/30">
						<p className="font-medium text-foreground truncate">
							{mockUser.name}
						</p>
						<p className="text-sm text-muted-foreground truncate">
							{mockUser.email}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{mockUser.role}
						</p>
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
							onClick={() => {
								console.log("Logout clicked");
								setIsOpen(false);
							}}
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
