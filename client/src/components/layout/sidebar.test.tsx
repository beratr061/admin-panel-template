/**
 * Property Tests: Sidebar Component
 * Feature: admin-panel-template
 * 
 * Property 5: Sidebar Collapse Toggle Works
 * Validates: Requirements 3.1
 * 
 * Property 6: Sidebar State Persists
 * Validates: Requirements 3.2
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import * as fc from "fast-check";
import { Sidebar, SIDEBAR_STORAGE_KEY, useSidebarState } from "./sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// Mock usePermission hook
vi.mock("@/hooks/use-permission", () => ({
  usePermission: () => ({
    can: () => true,
    canAny: () => true,
    permissions: [],
    isLoading: false,
  }),
}));

// Helper component to test useSidebarState hook
function SidebarStateTestComponent({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
  const { collapsed, toggle, setCollapsed } = useSidebarState(defaultCollapsed);
  return (
    <div>
      <span data-testid="collapsed-state">{String(collapsed)}</span>
      <button data-testid="toggle-btn" onClick={toggle}>Toggle</button>
      <button data-testid="set-true-btn" onClick={() => setCollapsed(true)}>Set True</button>
      <button data-testid="set-false-btn" onClick={() => setCollapsed(false)}>Set False</button>
    </div>
  );
}

describe("Sidebar - Property Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  /**
   * Property 5: Sidebar Collapse Toggle Works
   * For any sidebar toggle action, the sidebar should switch between collapsed (icon-only) 
   * and expanded (full-width) states.
   */
  it("Property 5: Sidebar collapse toggle works - for any initial state, toggling should switch to opposite state", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (initialCollapsed) => {
          // Clean up from previous iteration
          cleanup();
          localStorage.clear();
          
          // Set initial state
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(initialCollapsed));

          render(<Sidebar />);

          const sidebar = screen.getByTestId("sidebar");
          const toggleButton = screen.getByTestId("sidebar-toggle");

          // Verify initial state
          expect(sidebar.getAttribute("data-collapsed")).toBe(String(initialCollapsed));

          // Click toggle
          fireEvent.click(toggleButton);

          // Verify state changed to opposite
          expect(sidebar.getAttribute("data-collapsed")).toBe(String(!initialCollapsed));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Double toggle returns to original state (idempotence)
   */
  it("Property: Double toggle returns to original state", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (initialCollapsed) => {
          cleanup();
          localStorage.clear();
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(initialCollapsed));

          render(<Sidebar />);

          const sidebar = screen.getByTestId("sidebar");
          const toggleButton = screen.getByTestId("sidebar-toggle");

          // First toggle
          fireEvent.click(toggleButton);
          expect(sidebar.getAttribute("data-collapsed")).toBe(String(!initialCollapsed));

          // Second toggle
          fireEvent.click(toggleButton);
          expect(sidebar.getAttribute("data-collapsed")).toBe(String(initialCollapsed));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Sidebar State Persists
   * For any sidebar collapse/expand action, after page reload, the same state should be preserved.
   */
  it("Property 6: Sidebar state persists - state should be saved to localStorage", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.nat({ max: 5 }), // Number of toggles (0-5)
        (initialCollapsed, toggleCount) => {
          cleanup();
          localStorage.clear();
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(initialCollapsed));

          render(<Sidebar />);

          const toggleButton = screen.getByTestId("sidebar-toggle");

          // Perform toggles
          for (let i = 0; i < toggleCount; i++) {
            fireEvent.click(toggleButton);
          }

          // Calculate expected final state
          const expectedState = toggleCount % 2 === 0 ? initialCollapsed : !initialCollapsed;

          // Verify localStorage was updated
          const storedValue = localStorage.getItem(SIDEBAR_STORAGE_KEY);
          expect(storedValue).toBe(String(expectedState));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sidebar state persists across re-renders (simulating page reload)
   */
  it("Property 6: Sidebar state persists across re-renders", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (targetState) => {
          cleanup();
          localStorage.clear();

          // First render - set state
          const { unmount } = render(<SidebarStateTestComponent />);
          
          const setButton = targetState 
            ? screen.getByTestId("set-true-btn") 
            : screen.getByTestId("set-false-btn");
          fireEvent.click(setButton);

          // Verify state was set
          expect(screen.getByTestId("collapsed-state").textContent).toBe(String(targetState));

          // Unmount (simulate leaving page)
          unmount();

          // Re-render (simulate page reload)
          render(<SidebarStateTestComponent />);

          // Verify state persisted
          expect(screen.getByTestId("collapsed-state").textContent).toBe(String(targetState));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: useSidebarState hook toggle is consistent
   */
  it("Property: useSidebarState hook toggle works correctly", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (initialState) => {
          cleanup();
          localStorage.clear();
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(initialState));

          render(<SidebarStateTestComponent />);

          const stateDisplay = screen.getByTestId("collapsed-state");
          const toggleBtn = screen.getByTestId("toggle-btn");

          // Verify initial state
          expect(stateDisplay.textContent).toBe(String(initialState));

          // Toggle
          fireEvent.click(toggleBtn);
          expect(stateDisplay.textContent).toBe(String(!initialState));

          // Toggle back
          fireEvent.click(toggleBtn);
          expect(stateDisplay.textContent).toBe(String(initialState));
        }
      ),
      { numRuns: 100 }
    );
  });
});
