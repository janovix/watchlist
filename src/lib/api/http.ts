import { getDataEnvironment } from "@/lib/environment-store";

export class ApiError extends Error {
	name = "ApiError" as const;
	status: number;
	body: unknown;
	code?: string;

	constructor(
		message: string,
		opts: { status: number; body: unknown; code?: string },
	) {
		super(message);
		this.status = opts.status;
		this.body = opts.body;
		this.code = opts.code;
	}
}

function isClientSide(): boolean {
	return typeof window !== "undefined";
}

function isTestEnvironment(): boolean {
	return (
		typeof process !== "undefined" &&
		(process.env.NODE_ENV === "test" ||
			process.env.VITEST === "true" ||
			process.env.JEST_WORKER_ID !== undefined)
	);
}

export interface FetchJsonOptions extends RequestInit {
	/**
	 * JWT token to include in Authorization header.
	 * When provided, adds `Authorization: Bearer <jwt>` header.
	 */
	jwt?: string;
}

export async function fetchJson<T>(
	url: string,
	init?: FetchJsonOptions,
): Promise<{ status: number; json: T }> {
	const { jwt, ...fetchInit } = init ?? {};
	const headers: Record<string, string> = {
		accept: "application/json",
		...(fetchInit?.headers as Record<string, string> | undefined),
	};
	if (jwt) {
		headers.Authorization = `Bearer ${jwt}`;
	}

	if (isClientSide() && !isTestEnvironment()) {
		headers["X-Environment"] = getDataEnvironment();
	}

	const res = await fetch(url, {
		...fetchInit,
		headers,
	});

	const contentType = res.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");
	const body = isJson ? await res.json().catch(() => null) : await res.text();

	if (!res.ok) {
		const errorCode =
			typeof body === "object" &&
			body !== null &&
			"code" in body &&
			typeof (body as Record<string, unknown>).code === "string"
				? ((body as Record<string, unknown>).code as string)
				: undefined;
		throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, {
			status: res.status,
			body,
			code: errorCode,
		});
	}

	return { status: res.status, json: body as T };
}
