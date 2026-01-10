/**
 * Property Test: Breadcrumb Reflects Current Path
 * Feature: admin-panel-template, Property 7: Breadcrumb Reflects Current Path
 * Validates: Requirements 3.8
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as fc from "fast-check";
import { Breadcrumb, generateBreadcrumbsFromPath } from "./breadcrumb";

// Variable to hold the mocked pathname
let mockPathname = "/dashboard";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Helper to set the mock pathname
function setMockPathname(pathname: string) {
  mockPathname = pathname;
}

// Valid route segments for testing
const validRouteSegments = [
  "dashboard",
  "users",
  "roles",
  "settings",
  "profile",
  "create",
  "edit",
];

describe("Breadcrumb - Property Tests", () => {
  beforeEach(() => {
    cleanup();
    mockPathname = "/dashboard";
  });

  /**
   * Property 7: Breadcrumb Reflects Current Path
   * For any page navigation, the breadcrumb should accurately reflect the current route hierarchy.
   */
  it("Property 7: Breadcrumb reflects current path - generated breadcrumbs match path segments", () => {
    fc.assert(
      fc.property(
        // Generate a path with 1-4 segments
        fc.array(fc.constantFrom(...validRouteSegments), { minLength: 1, maxLength: 4 }),
        (segments) => {
          const pathname = "/" + segments.join("/");
          const breadcrumbs = generateBreadcrumbsFromPath(pathname);

          // Number of breadcrumbs should match number of segments
          expect(breadcrumbs.length).toBe(segments.length);

          // Each breadcrumb should correspond to a segment
          segments.forEach((segment, index) => {
            const breadcrumb = breadcrumbs[index];
            // Label should be derived from segment (capitalized)
            expect(breadcrumb.label.toLowerCase()).toContain(segment.toLowerCase().replace(/-/g, " ").split(" ")[0]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Breadcrumb hrefs build up correctly
   * Each breadcrumb href should be the cumulative path up to that segment
   */
  it("Property: Breadcrumb hrefs are cumulative paths", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...validRouteSegments), { minLength: 1, maxLength: 4 }),
        (segments) => {
          const pathname = "/" + segments.join("/");
          const breadcrumbs = generateBreadcrumbsFromPath(pathname);

          let expectedPath = "";
          segments.forEach((segment, index) => {
            expectedPath += "/" + segment;
            const breadcrumb = breadcrumbs[index];
            
            // Last item should not have href (current page)
            if (index === segments.length - 1) {
              expect(breadcrumb.href).toBeUndefined();
            } else {
              expect(breadcrumb.href).toBe(expectedPath);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty path produces empty breadcrumbs
   */
  it("Property: Root path produces empty breadcrumbs", () => {
    const breadcrumbs = generateBreadcrumbsFromPath("/");
    expect(breadcrumbs.length).toBe(0);
  });

  /**
   * Property: Breadcrumb component renders correct number of items
   */
  it("Property: Breadcrumb component renders items matching path depth", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...validRouteSegments), { minLength: 1, maxLength: 3 }),
        (segments) => {
          cleanup();
          const pathname = "/" + segments.join("/");
          setMockPathname(pathname);

          render(<Breadcrumb />);

          // Check that breadcrumb items are rendered
          const breadcrumbNav = screen.getByTestId("breadcrumb");
          expect(breadcrumbNav).toBeInTheDocument();

          // Count rendered breadcrumb items (excluding home)
          segments.forEach((_, index) => {
            const item = screen.getByTestId(`breadcrumb-item-${index}`);
            expect(item).toBeInTheDocument();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Last breadcrumb item is not a link (current page)
   */
  it("Property: Last breadcrumb item is current page (not a link)", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...validRouteSegments), { minLength: 1, maxLength: 3 }),
        (segments) => {
          cleanup();
          const pathname = "/" + segments.join("/");
          setMockPathname(pathname);

          render(<Breadcrumb />);

          const lastIndex = segments.length - 1;
          const lastItem = screen.getByTestId(`breadcrumb-item-${lastIndex}`);
          
          // Last item should be a span (not a link)
          expect(lastItem.tagName.toLowerCase()).toBe("span");
          expect(lastItem.getAttribute("aria-current")).toBe("page");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Home link is always present when showHome is true
   */
  it("Property: Home link is present when showHome is true", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...validRouteSegments), { minLength: 1, maxLength: 3 }),
        (segments) => {
          cleanup();
          const pathname = "/" + segments.join("/");
          setMockPathname(pathname);

          render(<Breadcrumb showHome={true} />);

          const homeLink = screen.getByTestId("breadcrumb-home");
          expect(homeLink).toBeInTheDocument();
          expect(homeLink.getAttribute("href")).toBe("/dashboard");
        }
      ),
      { numRuns: 100 }
    );
  });
});
