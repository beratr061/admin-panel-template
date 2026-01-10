/**
 * Property Test: Theme Persists Across Sessions
 * Feature: admin-panel-template, Property 2: Theme Persists Across Sessions
 * Validates: Requirements 2.4
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

describe("Theme Persistence - Property Tests", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document class
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.removeAttribute("class");
    document.documentElement.removeAttribute("style");
  });

  /**
   * Property 2: Theme Persists Across Sessions
   * For any theme selection, after page reload, the same theme should be active (round-trip persistence).
   */
  it("Property 2: Theme persists across sessions - for any theme, saving and reloading should preserve the theme", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("light", "dark") as fc.Arbitrary<"light" | "dark">,
        async (theme) => {
          // Clean up from previous iteration
          cleanup();
          localStorage.clear();
          document.documentElement.classList.remove("dark", "light");
          document.documentElement.removeAttribute("class");
          document.documentElement.removeAttribute("style");

          // Simulate setting a theme (as if user selected it)
          localStorage.setItem("theme", theme);

          // First render - simulates initial page load
          renderThemeToggle(theme);

          await waitFor(() => {
            const buttons = screen.getAllByTestId("theme-toggle");
            expect(buttons.length).toBe(1);
          });

          // Verify theme is stored
          expect(localStorage.getItem("theme")).toBe(theme);

          // Cleanup to simulate page unload
          cleanup();

          // Second render - simulates page reload (session restart)
          // The theme should be read from localStorage
          renderThemeToggle(localStorage.getItem("theme") as "light" | "dark");

          await waitFor(() => {
            const buttons = screen.getAllByTestId("theme-toggle");
            expect(buttons.length).toBe(1);
          });

          // Verify theme persisted
          const persistedTheme = localStorage.getItem("theme");
          expect(persistedTheme).toBe(theme);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Theme changes persist across sessions
   * For any initial theme, changing it and reloading should show the new theme
   */
  it("Property: Theme changes persist across sessions - changing theme and reloading preserves the change", async () => {
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

          // First render
          renderThemeToggle(initialTheme);

          await waitFor(() => {
            const buttons = screen.getAllByTestId("theme-toggle");
            expect(buttons.length).toBe(1);
          });

          // Toggle theme
          const toggleButton = screen.getByTestId("theme-toggle");
          fireEvent.click(toggleButton);

          const expectedNewTheme = initialTheme === "dark" ? "light" : "dark";

          await waitFor(() => {
            expect(localStorage.getItem("theme")).toBe(expectedNewTheme);
          });

          // Cleanup to simulate page unload
          cleanup();

          // Second render - simulates page reload
          renderThemeToggle(localStorage.getItem("theme") as "light" | "dark");

          await waitFor(() => {
            const buttons = screen.getAllByTestId("theme-toggle");
            expect(buttons.length).toBe(1);
          });

          // Verify the changed theme persisted
          expect(localStorage.getItem("theme")).toBe(expectedNewTheme);
        }
      ),
      { numRuns: 100 }
    );
  });
});
