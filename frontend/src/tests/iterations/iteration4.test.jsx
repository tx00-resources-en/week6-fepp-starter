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

describe("Iteration 4 - password confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
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

  it("shows error and does not call signup API when passwords do not match", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByLabelText(/email:/i), "test@test.com");
    await user.type(screen.getByLabelText(/^password:/i), "password123");
    await user.type(screen.getByLabelText(/confirm password:/i), "different");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("submits signup when passwords match", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: "test@test.com", token: "abc123" }),
    });

    const { setIsAuthenticated } = renderSignup();

    await user.type(screen.getByLabelText(/email:/i), "test@test.com");
    await user.type(screen.getByLabelText(/^password:/i), "password123");
    await user.type(screen.getByLabelText(/confirm password:/i), "password123");

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@test.com", password: "password123" }),
      });
      expect(sessionStorage.getItem("user")).toBeTruthy();
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
