import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrgPicker } from "./org-picker";

const mockOrganizationList = vi.fn();
const mockGetSession = vi.fn();
const mockSetActive = vi.fn();

vi.mock("@/lib/auth/authClient", () => ({
	authClient: {
		organization: {
			list: () => mockOrganizationList(),
			setActive: (opts: unknown) => mockSetActive(opts),
		},
		getSession: () => mockGetSession(),
	},
}));

vi.mock("@/lib/auth/config", () => ({
	getAuthAppUrl: () => "https://auth.example.com",
}));

vi.mock("@/components/language-provider", () => ({
	useLanguage: () => ({
		t: (key: string) => key,
		language: "en",
		setLanguage: vi.fn(),
	}),
}));

describe("OrgPicker", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset window.location
		Object.defineProperty(window, "location", {
			value: { reload: vi.fn(), href: "" },
			writable: true,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("should render a skeleton while loading", () => {
		// Never resolves so stays in loading state
		mockOrganizationList.mockReturnValue(new Promise(() => {}));

		const { container } = render(<OrgPicker />);

		// Skeleton has the class rounded-lg
		const skeleton = container.querySelector(".rounded-lg");
		expect(skeleton).toBeTruthy();
	});

	it("should render null when org list is empty", async () => {
		mockOrganizationList.mockResolvedValue({ data: [] });

		const { container } = render(<OrgPicker />);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});
	});

	it("should render null when org list fetch fails", async () => {
		mockOrganizationList.mockRejectedValue(new Error("fetch failed"));
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { container } = render(<OrgPicker />);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});

		warnSpy.mockRestore();
	});

	it("should render org initials button after orgs load", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Acme Corp",
					slug: "acme",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			// OrgAvatar renders initials "AC" for "Acme Corp"
			expect(screen.getByText("AC")).toBeInTheDocument();
		});
	});

	it("should render org logo image when logo is provided", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Logo Corp",
					slug: "logo",
					logo: "https://cdn.example.com/logo.png",
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			const img = screen.getByAltText("Logo Corp");
			expect(img).toHaveAttribute("src", "https://cdn.example.com/logo.png");
		});
	});

	it("should show org names in dropdown after clicking trigger", async () => {
		const user = userEvent.setup();
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Acme Corp",
					slug: "acme",
					logo: null,
					role: "owner",
				},
				{
					id: "org-2",
					name: "Beta Inc",
					slug: "beta",
					logo: null,
					role: "member",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("AC")).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole("button", { name: "switchOrganization" }),
		);

		await waitFor(
			() => {
				const menuItems = screen.getAllByRole("menuitem");
				expect(menuItems.length).toBeGreaterThan(0);
				const names = menuItems.map((item) => item.textContent);
				expect(names.some((n) => n?.includes("Acme Corp"))).toBe(true);
				expect(names.some((n) => n?.includes("Beta Inc"))).toBe(true);
			},
			{ timeout: 3000 },
		);
	});

	it("should show role section labels when orgs have roles", async () => {
		const user = userEvent.setup();
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "My Org",
					slug: "my-org",
					logo: null,
					role: "owner",
				},
				{
					id: "org-2",
					name: "Other Org",
					slug: "other",
					logo: null,
					role: "member",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("MO")).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole("button", { name: "switchOrganization" }),
		);

		await waitFor(
			() => {
				expect(screen.getByText("myOrganizations")).toBeInTheDocument();
				expect(screen.getByText("memberOf")).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});

	it("should show organizations label and create org option", async () => {
		const user = userEvent.setup();
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Solo Corp",
					slug: "solo",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("SC")).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole("button", { name: "switchOrganization" }),
		);

		await waitFor(
			() => {
				expect(screen.getByText("organizations")).toBeInTheDocument();
				expect(screen.getByText("createOrganization")).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});

	it("should redirect to new org URL when create org is clicked", async () => {
		const user = userEvent.setup();
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Solo Corp",
					slug: "solo",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("SC")).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole("button", { name: "switchOrganization" }),
		);

		await waitFor(
			() => {
				expect(screen.getByText("createOrganization")).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);

		await user.click(screen.getByText("createOrganization"));

		expect(window.location.href).toBe(
			"https://auth.example.com/settings/organization/new",
		);
	});

	it("should display question mark avatar when active org not found", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Acme Corp",
					slug: "acme",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "unknown-id" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			// Falls back to "?" when active org ID doesn't match any org
			expect(screen.getByText("?")).toBeInTheDocument();
		});
	});

	it("should use first org id when session has no activeOrganizationId", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "First Org",
					slug: "first",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: {} },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("FO")).toBeInTheDocument();
		});
	});

	it("calls setActive and reloads when switching to another organization", async () => {
		const user = userEvent.setup();
		const reloadMock = vi.fn();
		Object.defineProperty(window, "location", {
			value: { reload: reloadMock, href: "" },
			writable: true,
		});
		mockSetActive.mockResolvedValue(undefined);
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Acme Corp",
					slug: "acme",
					logo: null,
					role: "owner",
				},
				{
					id: "org-2",
					name: "Beta Inc",
					slug: "beta",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("AC")).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole("button", { name: "switchOrganization" }),
		);

		await waitFor(
			() => {
				expect(screen.getByText("Beta Inc")).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);

		await user.click(screen.getByText("Beta Inc"));

		await waitFor(() => {
			expect(mockSetActive).toHaveBeenCalledWith({
				organizationId: "org-2",
			});
			expect(reloadMock).toHaveBeenCalled();
		});
	});

	it("should hide picker when getSession fails after org list loads", async () => {
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Acme",
					slug: "acme",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockRejectedValue(new Error("session failed"));
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const { container } = render(<OrgPicker />);

		await waitFor(() => {
			expect(container.firstChild).toBeNull();
		});

		warnSpy.mockRestore();
	});

	it("should render settings link with correct URL for each org", async () => {
		const user = userEvent.setup();
		mockOrganizationList.mockResolvedValue({
			data: [
				{
					id: "org-1",
					name: "Acme Corp",
					slug: "acme-slug",
					logo: null,
					role: "owner",
				},
			],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText("AC")).toBeInTheDocument();
		});

		await user.click(
			screen.getByRole("button", { name: "switchOrganization" }),
		);

		await waitFor(
			() => {
				const links = screen.getAllByRole("link");
				const settingsLink = links.find((l) =>
					l
						.getAttribute("href")
						?.includes("settings/organization?org=acme-slug"),
				);
				expect(settingsLink).toBeTruthy();
				expect(settingsLink).toHaveAttribute(
					"href",
					"https://auth.example.com/settings/organization?org=acme-slug",
				);
			},
			{ timeout: 3000 },
		);
	});
});

describe("OrgPicker - org initials logic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it.each([
		["Acme Corp", "AC"],
		["Solo", "S"],
		["", "?"],
		["   ", "?"],
		["Three Word Name", "TN"],
	])("getOrgInitials('%s') should render '%s'", async (name, expected) => {
		mockOrganizationList.mockResolvedValue({
			data: [{ id: "org-1", name, slug: "slug", logo: null, role: "owner" }],
		});
		mockGetSession.mockResolvedValue({
			data: { session: { activeOrganizationId: "org-1" } },
		});

		render(<OrgPicker />);

		await waitFor(() => {
			expect(screen.getByText(expected)).toBeInTheDocument();
		});
	});
});
