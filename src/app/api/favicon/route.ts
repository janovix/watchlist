import { NextRequest, NextResponse } from "next/server";

/** Safe hostname for favicon proxy (no path, port, or unicode tricks). */
const HOST_RE = /^[\w.-]+$/;

export async function GET(request: NextRequest) {
	const host =
		request.nextUrl.searchParams.get("host")?.trim().toLowerCase() ?? "";
	if (!HOST_RE.test(host) || host.length > 253) {
		return NextResponse.json({ error: "invalid host" }, { status: 400 });
	}

	const upstream = await fetch(
		`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
		{ next: { revalidate: 86_400 } },
	);

	if (!upstream.ok) {
		return new NextResponse(null, { status: 502 });
	}

	const buf = await upstream.arrayBuffer();
	const contentType = upstream.headers.get("content-type") ?? "image/png";

	return new NextResponse(buf, {
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=86400",
		},
	});
}
