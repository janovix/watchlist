"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";
import { extractHostname } from "@/components/external-link-dialog";

function getFaviconUrl(hostname: string, size = 16): string {
	return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${size}`;
}

export function Favicon({
	url,
	className = "h-3 w-3 shrink-0 inline",
}: {
	url: string;
	className?: string;
}) {
	const [failed, setFailed] = useState(false);
	const hostname = extractHostname(url);

	if (failed) {
		return <Link2 className={className} />;
	}

	return (
		<img
			src={getFaviconUrl(hostname)}
			alt=""
			className={className}
			onError={() => setFailed(true)}
			loading="lazy"
		/>
	);
}
