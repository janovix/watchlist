import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserMenu } from "./user-menu";
import { LanguageProvider } from "./language-provider";

const renderWithProvider = (component: React.ReactElement) => {
	return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("UserMenu", () => {
	it("should render user menu button", () => {
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]');
		expect(button).toBeInTheDocument();
	});

	it("should display user initials when no avatar", () => {
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]');
		expect(button).toHaveTextContent("MG"); // María García initials
	});

	it("should open menu when clicked", async () => {
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			expect(screen.getByText(/María García/i)).toBeInTheDocument();
		});
	});

	it("should display user information in menu", async () => {
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			expect(screen.getByText(/María García/i)).toBeInTheDocument();
			expect(screen.getByText(/maria\.garcia@empresa\.com/i)).toBeInTheDocument();
			expect(screen.getByText(/Compliance Officer/i)).toBeInTheDocument();
		});
	});

	it("should display menu items", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			expect(screen.getByText(/Profile|Perfil/i)).toBeInTheDocument();
			expect(screen.getByText(/Settings|Configuración/i)).toBeInTheDocument();
			expect(screen.getByText(/Help|Ayuda/i)).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});

	it("should close menu when clicking outside", async () => {
		const { container } = renderWithProvider(
			<div>
				<UserMenu />
				<div data-testid="outside">Outside</div>
			</div>,
		);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			expect(screen.getByText(/María García/i)).toBeInTheDocument();
		});

		const outside = screen.getByTestId("outside");
		fireEvent.mouseDown(outside);

		await waitFor(() => {
			expect(screen.queryByText(/María García/i)).not.toBeInTheDocument();
		});
	});

	it("should call action when menu item is clicked", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			const profileButton = screen.getByText(/Profile|Perfil/i);
			fireEvent.click(profileButton);
		});

		expect(consoleSpy).toHaveBeenCalledWith("Profile clicked");

		consoleSpy.mockRestore();
	});

	it("should close menu after clicking a menu item", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			const settingsButton = screen.getByText(/Settings|Configuración/i);
			fireEvent.click(settingsButton);
		});

		await waitFor(() => {
			expect(screen.queryByText(/María García/i)).not.toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});

	it("should display logout button", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const { container } = renderWithProvider(<UserMenu />);

		const button = container.querySelector('button[aria-label="User menu"]') as HTMLButtonElement;
		if (button) {
			fireEvent.click(button);
		}

		await waitFor(() => {
			expect(screen.getByText(/Log out|Cerrar sesión|Sair/i)).toBeInTheDocument();
		});

		consoleSpy.mockRestore();
	});
});
