import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginComponent from "../../pages/LoginComponent";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Iteration 3 - useLogin hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderLogin = () => {
    const setIsAuthenticated = vi.fn();
    return {
      setIsAuthenticated,
      ...render(
        <BrowserRouter>
          <LoginComponent setIsAuthenticated={setIsAuthenticated} />
        </BrowserRouter>
      ),
    };
  };

  it("logs in user via useLogin hook", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "test@test.com", token: "token123" }),
    });

    const { setIsAuthenticated } = renderLogin();

    await user.type(screen.getByLabelText(/email:/i), "test@test.com");
    await user.type(screen.getByLabelText(/password:/i), "password123");

    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@test.com", password: "password123" }),
      });
      const storedUser =
        sessionStorage.getItem("user") || localStorage.getItem("user");
      expect(storedUser).toBeTruthy();
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
