import { InfoPageSkeleton } from "./page";
import { Footer } from "@/components/footer";

export default function Loading() {
	return (
		<main className="flex flex-1 flex-col min-h-0">
			<InfoPageSkeleton />
			<Footer />
		</main>
	);
}
