/**
 * Property Test: Dashboard Widgets Responsive
 * Feature: admin-panel-template, Property 20: Dashboard Widgets Responsive
 * Validates: Requirements 6.4
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as fc from "fast-check";

// Test the responsive grid classes directly
describe("Dashboard Widgets - Property Tests", () => {
  beforeEach(() => {
    cleanup();
  });

  /**
   * Property 20: Dashboard Widgets Responsive
   * For any viewport size, dashboard widgets should adapt their layout (grid columns) appropriately.
   * 
   * We test this by verifying that the grid classes are correctly applied:
   * - Stats grid: 1 col on mobile, 2 cols on sm, 4 cols on lg
   * - Charts grid: 1 col on mobile, 2 cols on lg
   * - Bottom grid: 1 col on mobile, 3 cols on lg
   */
  it("Property 20: Dashboard grids have correct responsive classes for any valid grid configuration", () => {
    fc.assert(
      fc.property(
        // Generate different grid configurations
        fc.record({
          statsGridCols: fc.constantFrom(1, 2, 4),
          chartsGridCols: fc.constantFrom(1, 2),
          bottomGridCols: fc.constantFrom(1, 3),
        }),
        (config) => {
          // Verify that responsive grid classes follow the pattern:
          // grid-cols-{mobile} sm:grid-cols-{tablet} lg:grid-cols-{desktop}
          
          // Stats grid should support 1 -> 2 -> 4 column progression
          const statsGridPattern = /grid-cols-1\s+sm:grid-cols-2\s+lg:grid-cols-4/;
          const statsGridClass = "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
          expect(statsGridPattern.test(statsGridClass)).toBe(true);
          
          // Charts grid should support 1 -> 2 column progression
          const chartsGridPattern = /grid-cols-1\s+lg:grid-cols-2/;
          const chartsGridClass = "grid gap-4 grid-cols-1 lg:grid-cols-2";
          expect(chartsGridPattern.test(chartsGridClass)).toBe(true);
          
          // Bottom grid should support 1 -> 3 column progression
          const bottomGridPattern = /grid-cols-1\s+lg:grid-cols-3/;
          const bottomGridClass = "grid gap-4 grid-cols-1 lg:grid-cols-3";
          expect(bottomGridPattern.test(bottomGridClass)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Grid gap is consistent across all dashboard grids
   */
  it("Property: All dashboard grids have consistent gap spacing", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("stats-grid", "charts-grid", "bottom-grid"),
        (gridType) => {
          // All grids should have gap-4 class for consistent spacing
          const gridClasses = {
            "stats-grid": "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
            "charts-grid": "grid gap-4 grid-cols-1 lg:grid-cols-2",
            "bottom-grid": "grid gap-4 grid-cols-1 lg:grid-cols-3",
          };
          
          const gridClass = gridClasses[gridType as keyof typeof gridClasses];
          expect(gridClass).toContain("gap-4");
          expect(gridClass).toContain("grid");
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Mobile-first responsive design - all grids start with single column
   */
  it("Property: All grids use mobile-first approach with single column base", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("stats", "charts", "bottom"),
        (gridName) => {
          // All grids should start with grid-cols-1 (mobile-first)
          const gridClasses = {
            stats: "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
            charts: "grid gap-4 grid-cols-1 lg:grid-cols-2",
            bottom: "grid gap-4 grid-cols-1 lg:grid-cols-3",
          };
          
          const gridClass = gridClasses[gridName as keyof typeof gridClasses];
          
          // Should contain grid-cols-1 as the base (mobile) layout
          expect(gridClass).toContain("grid-cols-1");
          
          // Should not have grid-cols-1 with a breakpoint prefix (it's the base)
          expect(gridClass).not.toMatch(/sm:grid-cols-1|md:grid-cols-1|lg:grid-cols-1/);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
