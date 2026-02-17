"use client";

import { CheckCircle2, AlertTriangle, Loader2, Activity } from "lucide-react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { MatchResultsList } from "@/components/match-results-list";
import type { SearchQuery, QueryStatus } from "@/lib/api/queries";
import type { ConnectionStatus } from "@/hooks/useSearchQuery";
import type { PepRawResult } from "@/hooks/usePepSearch";

// ---------------------------------------------------------------------------
// Shape types for async result payloads stored in the DB / received via SSE
// ---------------------------------------------------------------------------

interface GrokPepResult {
	probability: number;
	summary: string;
	sources?: string[];
}

interface AdverseMediaResult {
	risk_level: "none" | "low" | "medium" | "high";
	findings?: string;
	sources?: string[];
}

interface ErrorResult {
	error: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type ItemStatus = "loading" | "complete_clear" | "complete_match" | "failed";

function resolveItemStatus(
	status: QueryStatus | null | undefined,
	count: number | null | undefined,
): ItemStatus {
	if (!status || status === "pending" || status === "running") return "loading";
	if (status === "failed") return "failed";
	return (count ?? 0) > 0 ? "complete_match" : "complete_clear";
}

function resolveAsyncItemStatus(
	status: QueryStatus | null | undefined,
	hasContent: boolean,
): ItemStatus {
	if (!status || status === "pending" || status === "running") return "loading";
	if (status === "failed") return "failed";
	return hasContent ? "complete_match" : "complete_clear";
}

function getStatusIcon(itemStatus: ItemStatus) {
	switch (itemStatus) {
		case "loading":
			return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
		case "complete_clear":
			return <CheckCircle2 className="h-5 w-5 text-green-500" />;
		case "complete_match":
			return <AlertTriangle className="h-5 w-5 text-red-500" />;
		case "failed":
			return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
	}
}

function getBorderColor(itemStatus: ItemStatus): string {
	switch (itemStatus) {
		case "loading":
			return "border-muted/30";
		case "complete_clear":
			return "border-green-500/50";
		case "complete_match":
			return "border-red-500/50";
		case "failed":
			return "border-yellow-500/50";
	}
}

function getMatchBadge(count: number | null | undefined, status: ItemStatus) {
	if (status === "loading") return null;
	if (status === "failed") return null;
	const c = count ?? 0;
	if (c === 0) return null;
	return (
		<Badge variant="destructive" className="ml-auto text-xs">
			{c} {c === 1 ? "match" : "matches"}
		</Badge>
	);
}

function SubsectionBadge({
	status,
}: {
	status: QueryStatus | null | undefined;
}) {
	if (!status || status === "pending" || status === "running") {
		return (
			<Badge variant="outline" className="gap-1 text-xs">
				<Loader2 className="h-3 w-3 animate-spin" />
				Buscando...
			</Badge>
		);
	}
	if (status === "failed") {
		return (
			<Badge
				variant="outline"
				className="gap-1 text-xs border-yellow-500/50 text-yellow-600"
			>
				<AlertTriangle className="h-3 w-3" />
				Error
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="gap-1 text-xs border-green-500/50 text-green-600"
		>
			<CheckCircle2 className="h-3 w-3" />
			Completado
		</Badge>
	);
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

interface ScreeningResultsCardProps {
	data: SearchQuery;
	connectionStatus: ConnectionStatus;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ScreeningResultsCard({
	data,
	connectionStatus,
}: ScreeningResultsCardProps) {
	// Synchronous result statuses
	const ofacStatus = resolveItemStatus(data.ofacStatus, data.ofacCount);
	const unStatus = resolveItemStatus(data.unStatus, data.unCount);
	const sat69bStatus = resolveItemStatus(data.sat69bStatus, data.sat69bCount);

	// Async PEP: determine combined status from both pepOfficial + pepAi
	const pepOfficialRaw = data.pepOfficialResult as
		| PepRawResult[]
		| { error: string }
		| null;
	const pepAiRaw = data.pepAiResult as GrokPepResult | ErrorResult | null;

	const pepOfficialHasMatches =
		Array.isArray(pepOfficialRaw) && pepOfficialRaw.length > 0;
	const pepAiHasMatches =
		pepAiRaw &&
		!("error" in pepAiRaw) &&
		(pepAiRaw as GrokPepResult).probability > 0;

	const pepOfficialItemStatus = resolveAsyncItemStatus(
		data.pepOfficialStatus,
		pepOfficialHasMatches,
	);
	const pepAiItemStatus = resolveAsyncItemStatus(
		data.pepAiStatus,
		!!pepAiHasMatches,
	);

	// Combined PEP item status: loading if either is loading, match if either has a match,
	// failed if either failed (and none has a match), clear only if both are clear
	let pepCombinedStatus: ItemStatus = "loading";
	if (pepOfficialItemStatus !== "loading" && pepAiItemStatus !== "loading") {
		if (
			pepOfficialItemStatus === "complete_match" ||
			pepAiItemStatus === "complete_match"
		) {
			pepCombinedStatus = "complete_match";
		} else if (
			pepOfficialItemStatus === "failed" ||
			pepAiItemStatus === "failed"
		) {
			pepCombinedStatus = "failed";
		} else {
			pepCombinedStatus = "complete_clear";
		}
	}

	// Adverse media
	const adverseMediaRaw = data.adverseMediaResult as
		| AdverseMediaResult
		| ErrorResult
		| null;
	const adverseMediaHasRisk =
		adverseMediaRaw &&
		!("error" in adverseMediaRaw) &&
		(adverseMediaRaw as AdverseMediaResult).risk_level !== "none";
	const adverseMediaStatus = resolveAsyncItemStatus(
		data.adverseMediaStatus,
		!!adverseMediaHasRisk,
	);

	return (
		<div className="space-y-2">
			{/* Live connection badge */}
			{connectionStatus === "connected" && (
				<div className="flex justify-end">
					<Badge
						variant="outline"
						className="gap-1 bg-blue-50 dark:bg-blue-950"
					>
						<Activity className="h-3 w-3 text-blue-500 animate-pulse" />
						<span className="text-blue-500 text-xs">En vivo</span>
					</Badge>
				</div>
			)}

			<Accordion type="multiple" className="space-y-2">
				{/* OFAC */}
				<AccordionItem
					value="ofac"
					className={cn(
						"rounded-lg border-2 px-4 overflow-hidden",
						getBorderColor(ofacStatus),
					)}
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getStatusIcon(ofacStatus)}
							<span className="font-semibold">OFAC Sanctions List</span>
							{getMatchBadge(data.ofacCount, ofacStatus)}
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{ofacStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								Verificando lista OFAC...
							</p>
						) : ofacStatus === "complete_clear" ? (
							<p className="text-green-600 text-sm">
								Sin coincidencias en la lista OFAC.
							</p>
						) : (
							data.ofacResult && (
								<MatchResultsList
									matches={
										(
											data.ofacResult as {
												matches: Parameters<
													typeof MatchResultsList
												>[0]["matches"][0][];
											}
										).matches
									}
								/>
							)
						)}
					</AccordionContent>
				</AccordionItem>

				{/* UNSC */}
				<AccordionItem
					value="un"
					className={cn(
						"rounded-lg border-2 px-4 overflow-hidden",
						getBorderColor(unStatus),
					)}
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getStatusIcon(unStatus)}
							<span className="font-semibold">UN Sanctions List</span>
							{getMatchBadge(data.unCount, unStatus)}
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{unStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								Verificando lista ONU...
							</p>
						) : unStatus === "complete_clear" ? (
							<p className="text-green-600 text-sm">
								Sin coincidencias en la lista de sanciones ONU.
							</p>
						) : (
							data.unResult && (
								<MatchResultsList
									matches={
										(
											data.unResult as {
												matches: Parameters<
													typeof MatchResultsList
												>[0]["matches"][0][];
											}
										).matches
									}
								/>
							)
						)}
					</AccordionContent>
				</AccordionItem>

				{/* SAT 69-B */}
				<AccordionItem
					value="sat69b"
					className={cn(
						"rounded-lg border-2 px-4 overflow-hidden",
						getBorderColor(sat69bStatus),
					)}
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getStatusIcon(sat69bStatus)}
							<span className="font-semibold">SAT 69-B</span>
							{getMatchBadge(data.sat69bCount, sat69bStatus)}
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{sat69bStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								Verificando lista SAT 69-B...
							</p>
						) : sat69bStatus === "complete_clear" ? (
							<p className="text-green-600 text-sm">
								Sin coincidencias en la lista SAT 69-B.
							</p>
						) : (
							data.sat69bResult && (
								<MatchResultsList
									matches={
										(
											data.sat69bResult as {
												matches: Parameters<
													typeof MatchResultsList
												>[0]["matches"][0][];
											}
										).matches
									}
								/>
							)
						)}
					</AccordionContent>
				</AccordionItem>

				{/* PEP — merged accordion for Official + AI */}
				<AccordionItem
					value="pep"
					className={cn(
						"rounded-lg border-2 px-4 overflow-hidden",
						getBorderColor(pepCombinedStatus),
					)}
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getStatusIcon(pepCombinedStatus)}
							<span className="font-semibold">
								Persona Políticamente Expuesta (PEP)
							</span>
							{pepCombinedStatus === "complete_match" && (
								<Badge variant="destructive" className="ml-auto text-xs">
									Coincidencias encontradas
								</Badge>
							)}
						</div>
					</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-4">
							{/* PEP Official subsection */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-muted-foreground">
										Plataforma de Transparencia (Oficial)
									</p>
									<SubsectionBadge status={data.pepOfficialStatus} />
								</div>
								{pepOfficialItemStatus === "loading" ? (
									<p className="text-muted-foreground text-sm pl-2">
										Buscando en la Plataforma de Transparencia...
									</p>
								) : pepOfficialItemStatus === "failed" ? (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="text-xs">
											{(pepOfficialRaw as ErrorResult)?.error ??
												"Error al consultar la Plataforma de Transparencia"}
										</AlertDescription>
									</Alert>
								) : !pepOfficialHasMatches ? (
									<p className="text-green-600 text-sm pl-2">
										No identificado como PEP en la Plataforma de Transparencia.
									</p>
								) : (
									<div className="space-y-2 pl-2">
										{(pepOfficialRaw as PepRawResult[]).map((result) => (
											<div
												key={result.id}
												className="border rounded-lg p-3 bg-card text-sm"
											>
												<p className="font-semibold">{result.nombre}</p>
												{result.informacionPrincipal?.institucion && (
													<p className="text-muted-foreground mt-1">
														<span className="font-medium">Institución: </span>
														{result.informacionPrincipal.institucion}
													</p>
												)}
												{result.informacionPrincipal?.cargo && (
													<p className="text-muted-foreground">
														<span className="font-medium">Cargo: </span>
														{result.informacionPrincipal.cargo}
													</p>
												)}
												{result.informacionPrincipal?.area && (
													<p className="text-muted-foreground">
														<span className="font-medium">Área: </span>
														{result.informacionPrincipal.area}
													</p>
												)}
											</div>
										))}
									</div>
								)}
							</div>

							<div className="border-t" />

							{/* PEP AI subsection */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium text-muted-foreground">
										Detección AI (Grok)
									</p>
									<SubsectionBadge status={data.pepAiStatus} />
								</div>
								{pepAiItemStatus === "loading" ? (
									<p className="text-muted-foreground text-sm pl-2">
										Analizando con inteligencia artificial...
									</p>
								) : pepAiItemStatus === "failed" ? (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="text-xs">
											{(pepAiRaw as ErrorResult)?.error ??
												"Error en la detección AI"}
										</AlertDescription>
									</Alert>
								) : !pepAiHasMatches ? (
									<p className="text-green-600 text-sm pl-2">
										No identificado como PEP por análisis AI.
									</p>
								) : (
									<div className="space-y-2 pl-2 text-sm">
										<div className="flex items-center gap-2">
											<span className="font-medium">Probabilidad:</span>
											<Badge
												variant={
													(pepAiRaw as GrokPepResult).probability > 0.5
														? "destructive"
														: "default"
												}
											>
												{Math.round(
													(pepAiRaw as GrokPepResult).probability * 100,
												)}
												%
											</Badge>
										</div>
										{(pepAiRaw as GrokPepResult).summary && (
											<p className="text-muted-foreground">
												{(pepAiRaw as GrokPepResult).summary}
											</p>
										)}
										{(pepAiRaw as GrokPepResult).sources &&
											(pepAiRaw as GrokPepResult).sources!.length > 0 && (
												<div>
													<p className="font-medium mb-1">Fuentes:</p>
													<ul className="list-disc list-inside space-y-1 text-muted-foreground">
														{(pepAiRaw as GrokPepResult).sources!.map(
															(src, i) => (
																<li key={i} className="text-xs truncate">
																	{src}
																</li>
															),
														)}
													</ul>
												</div>
											)}
									</div>
								)}
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>

				{/* Adverse Media */}
				<AccordionItem
					value="adverse-media"
					className={cn(
						"rounded-lg border-2 px-4 overflow-hidden",
						getBorderColor(adverseMediaStatus),
					)}
				>
					<AccordionTrigger className="hover:no-underline">
						<div className="flex items-center gap-3 w-full">
							{getStatusIcon(adverseMediaStatus)}
							<span className="font-semibold">Media Adversa</span>
							{adverseMediaStatus === "complete_match" && (
								<Badge variant="destructive" className="ml-auto text-xs">
									Riesgo detectado
								</Badge>
							)}
						</div>
					</AccordionTrigger>
					<AccordionContent>
						{adverseMediaStatus === "loading" ? (
							<p className="text-muted-foreground text-sm">
								Analizando medios y fuentes públicas...
							</p>
						) : adverseMediaStatus === "failed" ? (
							<Alert variant="destructive" className="py-2">
								<AlertDescription className="text-xs">
									{(adverseMediaRaw as ErrorResult)?.error ??
										"Error al analizar medios adversos"}
								</AlertDescription>
							</Alert>
						) : !adverseMediaHasRisk ? (
							<p className="text-green-600 text-sm">
								Sin indicios de medios adversos.
							</p>
						) : (
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<span className="font-medium">Nivel de riesgo:</span>
									<Badge
										variant={
											(adverseMediaRaw as AdverseMediaResult).risk_level ===
											"high"
												? "destructive"
												: "default"
										}
									>
										{(adverseMediaRaw as AdverseMediaResult).risk_level}
									</Badge>
								</div>
								{(adverseMediaRaw as AdverseMediaResult).findings && (
									<p className="text-muted-foreground">
										{(adverseMediaRaw as AdverseMediaResult).findings}
									</p>
								)}
								{(adverseMediaRaw as AdverseMediaResult).sources &&
									(adverseMediaRaw as AdverseMediaResult).sources!.length >
										0 && (
										<div>
											<p className="font-medium mb-1">Fuentes:</p>
											<ul className="list-disc list-inside space-y-1 text-muted-foreground">
												{(adverseMediaRaw as AdverseMediaResult).sources!.map(
													(src, i) => (
														<li key={i} className="text-xs truncate">
															{src}
														</li>
													),
												)}
											</ul>
										</div>
									)}
							</div>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
