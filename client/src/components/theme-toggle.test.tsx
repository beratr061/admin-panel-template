/**
 * Property Test: Theme Toggle Changes Theme
 * Feature: admin-panel-template, Property 1: Theme Toggle Changes Theme
 * Validates: Requirements 2.1
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import * as fc from "fast-check";
import { ThemeToggle } from "./theme-toggle";
import { ThemeProvider } from "@/providers/theme-provider";

// Helper to render ThemeToggle with provider
const renderThemeToggle = (defaultTheme: "light" | "dark" = "light") => {
  return render(
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey="theme"
    >
      <ThemeToggle />
    </ThemeProvider>
  );
};

describe("Theme Toggle - Property Tests", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document class
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.removeAttribute("class");
    document.documentElement.removeAttribute("style");
  });

  /**
   * Property 1: Theme Toggle Changes Theme
   * For any theme toggle action, the current theme should switch between 'light' and 'dark' modes.
   */
  it("Property 1: Theme toggle changes theme - for any initial theme, toggling should switch to the opposite theme", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("light", "dark") as fc.Arbitrary<"light" | "dark">,
        async (initialTheme) => {
          // Clean up from previous iteration
          cleanup();
          localStorage.clear();
          document.documentElement.classList.remove("dark", "light");
          document.documentElement.removeAttribute("class");
          document.documentElement.removeAttribute("style");

          // Set initial theme in localStorage
          localStorage.setItem("theme", initialTheme);

          renderThemeToggle(initialTheme);

          // Wait for component to mount
          await waitFor(() => {
            const buttons = screen.getAllByTestId("theme-toggle");
            expect(buttons.length).toBe(1);
          });

          // Get the toggle button
          const toggleButton = screen.getByTestId("theme-toggle");

          // Click to toggle theme
          fireEvent.click(toggleButton);

          // Wait for theme change
          await waitFor(() => {
            const storedTheme = localStorage.getItem("theme");
            const expectedTheme = initialTheme === "dark" ? "light" : "dark";
            expect(storedTheme).toBe(expectedTheme);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Theme toggle is idempotent over two clicks
   * Toggling twice should return to the original theme
   */
  it("Property: Double toggle returns to original theme", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("light", "dark") as fc.Arbitrary<"light" | "dark">,
        async (initialTheme) => {
          // Clean up from previous iteration
          cleanup();
          localStorage.clear();
          document.documentElement.classList.remove("dark", "light");
          document.documentElement.removeAttribute("class");
          document.documentElement.removeAttribute("style");

          // Set initial theme
          localStorage.setItem("theme", initialTheme);

          renderThemeToggle(initialTheme);

          await waitFor(() => {
            const buttons = screen.getAllByTestId("theme-toggle");
            expect(buttons.length).toBe(1);
          });

          const toggleButton = screen.getByTestId("theme-toggle");

          // First toggle
          fireEvent.click(toggleButton);

          await waitFor(() => {
            const storedTheme = localStorage.getItem("theme");
            expect(storedTheme).toBe(initialTheme === "dark" ? "light" : "dark");
          });

          // Second toggle
          fireEvent.click(toggleButton);

          await waitFor(() => {
            const storedTheme = localStorage.getItem("theme");
            expect(storedTheme).toBe(initialTheme);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
