import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApproachingUsageLimitBanner } from "./ApproachingUsageLimitBanner";

const mockGetUsageDetails = vi.fn();

vi.mock("@/lib/subscription/subscriptionClient", () => ({
	getUsageDetails: () => mockGetUsageDetails(),
}));

vi.mock("@/lib/auth/config", () => ({
	getAuthCoreBaseUrl: () => "https://auth.example.com",
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...rest
	}: {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

describe("ApproachingUsageLimitBanner", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	afterEach(() => {
		cleanup();
	});

	const baseDetails = () => ({
		period: { end: "2026-04-30" },
		limits: { watchlistQueriesPerMonth: 100 },
		usage: { watchlistQueries: 85 },
	});

	it("shows banner when usage is at or above 80% of quota", async () => {
		mockGetUsageDetails.mockResolvedValue(baseDetails());

		render(<ApproachingUsageLimitBanner />);

		await waitFor(() => {
			expect(
				screen.getByText(/Watchlist query usage is at 85%/),
			).toBeInTheDocument();
		});
		expect(
			screen.getByRole("link", { name: /Usage & billing/i }),
		).toHaveAttribute("href", "https://auth.example.com/settings/billing");
	});

	it("does not show when usage is below threshold", async () => {
		mockGetUsageDetails.mockResolvedValue({
			...baseDetails(),
			usage: { watchlistQueries: 50 },
		});

		const { container } = render(<ApproachingUsageLimitBanner />);

		await waitFor(() => {
			expect(mockGetUsageDetails).toHaveBeenCalled();
		});
		expect(container.firstChild).toBeNull();
	});

	it("does not show when limit is zero", async () => {
		mockGetUsageDetails.mockResolvedValue({
			...baseDetails(),
			limits: { watchlistQueriesPerMonth: 0 },
			usage: { watchlistQueries: 100 },
		});

		const { container } = render(<ApproachingUsageLimitBanner />);

		await waitFor(() => {
			expect(mockGetUsageDetails).toHaveBeenCalled();
		});
		expect(container.firstChild).toBeNull();
	});

	it("does not show when getUsageDetails returns nullish limits", async () => {
		mockGetUsageDetails.mockResolvedValue(null);

		const { container } = render(<ApproachingUsageLimitBanner />);

		await waitFor(() => {
			expect(mockGetUsageDetails).toHaveBeenCalled();
		});
		expect(container.firstChild).toBeNull();
	});

	it("does not show when banner was dismissed for this period", async () => {
		mockGetUsageDetails.mockResolvedValue(baseDetails());
		localStorage.setItem("janovix:watchlist-usage-banner:2026-04-30", "1");

		const { container } = render(<ApproachingUsageLimitBanner />);

		await waitFor(() => {
			expect(mockGetUsageDetails).toHaveBeenCalled();
		});
		expect(container.firstChild).toBeNull();
	});

	it("dismiss sets localStorage and hides banner", async () => {
		const user = userEvent.setup();
		mockGetUsageDetails.mockResolvedValue(baseDetails());

		render(<ApproachingUsageLimitBanner />);

		await waitFor(() => {
			expect(
				screen.getByText(/Watchlist query usage is at/),
			).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Dismiss" }));

		expect(
			localStorage.getItem("janovix:watchlist-usage-banner:2026-04-30"),
		).toBe("1");
		expect(
			screen.queryByText(/Watchlist query usage is at/),
		).not.toBeInTheDocument();
	});
});
