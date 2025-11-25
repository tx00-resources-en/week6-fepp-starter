import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Iteration 5 - sessionStorage auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    sessionStorage.clear();
  });

  const renderApp = () => {
    return render(<App />);
  };

  it("stores user in sessionStorage on login", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "test@test.com", token: "token123" }),
    });

    renderApp();

    // go to login page
    await user.click(screen.getByRole("link", { name: /login/i }));

    await user.type(screen.getByLabelText(/email:/i), "test@test.com");
    await user.type(screen.getByLabelText(/password:/i), "password123");

    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(sessionStorage.getItem("user")).toBeTruthy();
    });
  });

  it("clears sessionStorage on logout", async () => {
    const user = userEvent.setup();

    sessionStorage.setItem(
      "user",
      JSON.stringify({ email: "test@test.com", token: "token123" })
    );

    renderApp();

    // After having a user in sessionStorage, Navbar should show logout button
    const logoutButton = await screen.findByRole("button", { name: /log out/i });

    await user.click(logoutButton);

    await waitFor(() => {
      expect(sessionStorage.getItem("user")).toBeNull();
    });
  });
});
