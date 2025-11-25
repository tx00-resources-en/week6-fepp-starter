import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import SignupComponent from "../../pages/SignupComponent";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Iteration 8 - useField in Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderSignup = () => {
    const setIsAuthenticated = vi.fn();
    return {
      setIsAuthenticated,
      ...render(
        <BrowserRouter>
          <SignupComponent setIsAuthenticated={setIsAuthenticated} />
        </BrowserRouter>
      ),
    };
  };

  it("uses useField-controlled inputs and successfully signs up", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "test@test.com", token: "abc123" }),
    });

    const { setIsAuthenticated } = renderSignup();

    const emailInput = screen.getByLabelText(/email:/i);
    const passwordInput = screen.getByLabelText(/^password:/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password:/i);

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users/signup", {
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
