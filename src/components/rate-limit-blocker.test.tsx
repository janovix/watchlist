import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateLimitBlocker } from "./rate-limit-blocker";
import {
	AUTH_RATE_LIMIT_EVENT,
	type RateLimitEventDetail,
} from "@/lib/auth/authClient";

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				errorRateLimitTitle: "Rate limited",
				errorRateLimitDescription: "Wait {seconds} seconds",
				errorRateLimitDescriptionReady: "You can retry now",
				errorRateLimitRetry: "Retry",
				errorHome: "Home",
			};
			return map[key] ?? key;
		},
		language: "en",
		setLanguage: vi.fn(),
	}),
}));

function dispatchRateLimit(detail: RateLimitEventDetail) {
	window.dispatchEvent(
		new CustomEvent<RateLimitEventDetail>(AUTH_RATE_LIMIT_EVENT, { detail }),
	);
}

describe("RateLimitBlocker", () => {
	const assignSpy = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("location", {
			...window.location,
			href: "https://watchlist.test/queries",
			assign: assignSpy,
		});
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it("renders nothing before a rate limit event", () => {
		const { container } = render(<RateLimitBlocker />);
		expect(container.firstChild).toBeNull();
		expect(screen.queryByText("Rate limited")).not.toBeInTheDocument();
	});

	it("shows overlay when AUTH_RATE_LIMIT_EVENT fires", async () => {
		render(<RateLimitBlocker />);

		await act(async () => {
			dispatchRateLimit({ retryAfter: 0 });
		});

		expect(screen.getByText("Rate limited")).toBeInTheDocument();
		expect(screen.getByText("You can retry now")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
			"href",
			"/",
		);
	});

	it("shows countdown and disables retry while seconds remain", async () => {
		vi.useFakeTimers();
		render(<RateLimitBlocker />);

		await act(async () => {
			dispatchRateLimit({ retryAfter: 2 });
		});

		expect(screen.getByText("Wait 2 seconds")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
		const retry = screen.getByRole("button", { name: "Retry" });
		expect(retry).toBeDisabled();

		await act(async () => {
			vi.advanceTimersByTime(1000);
		});
		expect(screen.getByText("1")).toBeInTheDocument();

		await act(async () => {
			vi.advanceTimersByTime(1000);
		});
		expect(screen.queryByText("1")).not.toBeInTheDocument();
		expect(retry).not.toBeDisabled();
	});

	it("enables retry immediately when retryAfter is 0", async () => {
		render(<RateLimitBlocker />);

		await act(async () => {
			dispatchRateLimit({ retryAfter: 0 });
		});

		const retry = screen.getByRole("button", { name: "Retry" });
		expect(retry).not.toBeDisabled();
	});

	it("calls location.assign with captured return URL on retry", async () => {
		const user = userEvent.setup();
		render(<RateLimitBlocker />);

		await act(async () => {
			dispatchRateLimit({ retryAfter: 0 });
		});

		await user.click(screen.getByRole("button", { name: "Retry" }));

		expect(assignSpy).toHaveBeenCalledWith("https://watchlist.test/queries");
		expect(screen.queryByText("Rate limited")).not.toBeInTheDocument();
	});

	it("treats negative retryAfter as 0 countdown", async () => {
		render(<RateLimitBlocker />);

		await act(async () => {
			dispatchRateLimit({ retryAfter: -1 });
		});

		expect(screen.getByText("You can retry now")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Retry" })).not.toBeDisabled();
	});

	it("removes listener on unmount", async () => {
		const removeSpy = vi.spyOn(window, "removeEventListener");
		const { unmount } = render(<RateLimitBlocker />);
		unmount();
		expect(removeSpy).toHaveBeenCalledWith(
			AUTH_RATE_LIMIT_EVENT,
			expect.any(Function),
		);
		removeSpy.mockRestore();
	});
});
