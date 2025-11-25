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

describe("Iteration 2 - useSignup hook", () => {
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

  it("submits signup form using useSignup hook", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "test@test.com", token: "abc123" }),
    });

    const { setIsAuthenticated } = renderSignup();

    await user.type(screen.getByLabelText(/email:/i), "test@test.com");
    await user.type(screen.getByLabelText(/^password:/i), "password123");

    const confirmField = screen.queryByLabelText(/confirm password:/i);
    if (confirmField) {
      await user.type(confirmField, "password123");
    }

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
