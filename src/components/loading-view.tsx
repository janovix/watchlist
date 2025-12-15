"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Shield, Database, Clock } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface LoadingViewProps {
	searchName: string;
}

export function LoadingView({ searchName }: LoadingViewProps) {
	const [progress, setProgress] = useState(0);
	const [currentStep, setCurrentStep] = useState(0);
	const [elapsedTime, setElapsedTime] = useState(0);
	const { t } = useLanguage();

	const searchSteps = [
		t("step1"),
		t("step2"),
		t("step3"),
		t("step4"),
		t("step5"),
	];

	useEffect(() => {
		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 95) return prev;
				return prev + Math.random() * 2;
			});
		}, 500);

		const timeInterval = setInterval(() => {
			setElapsedTime((prev) => prev + 1);
		}, 1000);

		return () => {
			clearInterval(progressInterval);
			clearInterval(timeInterval);
		};
	}, []);

	useEffect(() => {
		const stepInterval = setInterval(() => {
			setCurrentStep((prev) =>
				prev < searchSteps.length - 1 ? prev + 1 : prev,
			);
		}, 3000);

		return () => clearInterval(stepInterval);
	}, [searchSteps.length]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<div className="w-full max-w-2xl mx-auto space-y-8">
			{/* Header */}
			<div className="text-center space-y-2">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
					<Shield className="h-8 w-8 text-primary animate-pulse" />
				</div>
				<h2 className="text-2xl font-semibold text-foreground">
					{t("verifyingIdentity")}
				</h2>
				<p className="text-muted-foreground">
					{t("searching")}{" "}
					<span className="text-foreground font-medium">{searchName}</span>
				</p>
			</div>

			{/* Progress */}
			<div className="space-y-4">
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">{t("progress")}</span>
					<span className="text-foreground font-mono">
						{Math.round(progress)}%
					</span>
				</div>
				<div className="h-2 bg-secondary rounded-full overflow-hidden">
					<div
						className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
						style={{ width: `${progress}%` }}
					/>
				</div>

				{/* Current Step */}
				<div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 border border-border">
					<Database className="h-5 w-5 text-primary animate-pulse" />
					<span className="text-sm text-foreground">
						{searchSteps[currentStep]}
					</span>
				</div>
			</div>

			{/* Time Elapsed */}
			<div className="flex items-center justify-center gap-2 text-muted-foreground">
				<Clock className="h-4 w-4" />
				<span className="text-sm font-mono">
					{t("timeElapsed")} {formatTime(elapsedTime)}
				</span>
			</div>

			{/* Warning Alert */}
			<div className="flex items-start gap-3 p-4 rounded-lg bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-900">
				<AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
				<p className="text-sm text-amber-700 dark:text-amber-300/90">
					<strong className="text-amber-800 dark:text-amber-300">
						{t("important")}
					</strong>{" "}
					{t("loadingWarning")}
				</p>
			</div>

			{/* Animated Dots */}
			<div className="flex justify-center gap-2">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="w-2 h-2 rounded-full bg-primary animate-bounce"
						style={{ animationDelay: `${i * 0.15}s` }}
					/>
				))}
			</div>
		</div>
	);
}
