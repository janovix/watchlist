import { QueryDetailPageSkeleton } from "./page";
import { Footer } from "@/components/footer";
import { LAYOUT_HORIZONTAL_PAD, LAYOUT_NARROW } from "@/lib/layout";
import { cn } from "@/lib/utils";

export default function Loading() {
	return (
		<div className="flex flex-1 flex-col min-h-0 w-full">
			<main className="flex-1 flex flex-col">
				<div
					className={cn(
						"flex-1 space-y-6 py-6 sm:py-8",
						LAYOUT_HORIZONTAL_PAD,
						LAYOUT_NARROW,
					)}
				>
					<QueryDetailPageSkeleton />
				</div>
			</main>
			<Footer />
		</div>
	);
}
