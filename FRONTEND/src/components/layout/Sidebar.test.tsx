import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import * as AuthContextModule from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Sidebar Component Role-Based Navigation", () => {
  const mockLogout = vi.fn();

  it("should render Administration section for ADMIN role", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { username: "adminuser", role: "ADMIN" },
      token: "mock-token",
      isAuthenticated: true,
      role: "ADMIN",
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      clearMustChangePassword: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Administration")).toBeDefined();
    expect(screen.getAllByText("ADMIN").length).toBeGreaterThan(0);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Managers")).toBeDefined();
  });

  it("should NOT render Administration section for MANAGER role", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { username: "manageruser", role: "MANAGER" },
      token: "mock-token",
      isAuthenticated: true,
      role: "MANAGER",
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      clearMustChangePassword: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.queryByText("Administration")).toBeNull();
    expect(screen.queryByText("Overview")).toBeNull();
    expect(screen.queryByText("Managers")).toBeNull();

    // Operational items should still exist
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Products")).toBeDefined();
    expect(screen.getByText("Warehouses")).toBeDefined();
  });

  it("should NOT render Administration section for CUSTOMER role", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      user: { username: "customeruser", role: "CUSTOMER" },
      token: "mock-token",
      isAuthenticated: true,
      role: "CUSTOMER",
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      clearMustChangePassword: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.queryByText("Administration")).toBeNull();
    expect(screen.queryByText("Overview")).toBeNull();
  });
});
