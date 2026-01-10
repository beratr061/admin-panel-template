/**
 * Property Test: Active Navigation Link Highlighted
 * Feature: admin-panel-template, Property 8: Active Navigation Link Highlighted
 * Validates: Requirements 3.9
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as fc from "fast-check";
import { Sidebar, type NavGroup } from "./sidebar";
import { LayoutDashboard, Users, Shield, Settings } from "lucide-react";

// Variable to hold the mocked pathname
let mockPathname = "/dashboard";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock usePermission hook - allow all permissions
vi.mock("@/hooks/use-permission", () => ({
  usePermission: () => ({
    can: () => true,
    canAny: () => true,
    permissions: ["users.read", "roles.read"],
    isLoading: false,
  }),
}));

// Helper to set the mock pathname
function setMockPathname(pathname: string) {
  mockPathname = pathname;
}

// Test navigation configuration
const testNavGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        id: "users",
        label: "Users",
        icon: Users,
        href: "/users",
      },
      {
        id: "roles",
        label: "Roles",
        icon: Shield,
        href: "/roles",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        href: "/settings",
      },
    ],
  },
];

// All nav items flattened for testing
const allNavItems = testNavGroups.flatMap(group => group.items);

describe("Navigation - Property Tests", () => {
  beforeEach(() => {
    cleanup();
    mockPathname = "/dashboard";
  });

  /**
   * Property 8: Active Navigation Link Highlighted
   * For any current route, the corresponding sidebar navigation item should have 
   * a distinct highlighted style (data-active="true").
   */
  it("Property 8: Active navigation link highlighted - matching route has data-active=true", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allNavItems),
        (navItem) => {
          cleanup();
          setMockPathname(navItem.href);

          render(<Sidebar navGroups={testNavGroups} />);

          const navElement = screen.getByTestId(`nav-item-${navItem.id}`);
          
          // The active nav item should have data-active="true"
          expect(navElement.getAttribute("data-active")).toBe("true");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Only one nav item is active at a time
   */
  it("Property: Only one nav item is active for any given path", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allNavItems),
        (activeNavItem) => {
          cleanup();
          setMockPathname(activeNavItem.href);

          render(<Sidebar navGroups={testNavGroups} />);

          // Count active items
          let activeCount = 0;
          allNavItems.forEach(item => {
            const navElement = screen.getByTestId(`nav-item-${item.id}`);
            if (navElement.getAttribute("data-active") === "true") {
              activeCount++;
            }
          });

          // Exactly one item should be active
          expect(activeCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Non-matching routes are not highlighted
   */
  it("Property: Non-matching nav items have data-active=false", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allNavItems),
        (activeNavItem) => {
          cleanup();
          setMockPathname(activeNavItem.href);

          render(<Sidebar navGroups={testNavGroups} />);

          // Check that other items are not active
          allNavItems.forEach(item => {
            if (item.id !== activeNavItem.id) {
              const navElement = screen.getByTestId(`nav-item-${item.id}`);
              expect(navElement.getAttribute("data-active")).toBe("false");
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Nested routes highlight parent nav item
   * e.g., /users/123/edit should highlight the "users" nav item
   */
  it("Property: Nested routes highlight parent nav item", () => {
    const nestedPaths = [
      { path: "/users/123", expectedActiveId: "users" },
      { path: "/users/create", expectedActiveId: "users" },
      { path: "/users/123/edit", expectedActiveId: "users" },
      { path: "/roles/admin", expectedActiveId: "roles" },
      { path: "/settings/profile", expectedActiveId: "settings" },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...nestedPaths),
        ({ path, expectedActiveId }) => {
          cleanup();
          setMockPathname(path);

          render(<Sidebar navGroups={testNavGroups} />);

          const expectedActiveElement = screen.getByTestId(`nav-item-${expectedActiveId}`);
          expect(expectedActiveElement.getAttribute("data-active")).toBe("true");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Dashboard is active for root path
   */
  it("Property: Dashboard is active for root path", () => {
    cleanup();
    setMockPathname("/");

    render(<Sidebar navGroups={testNavGroups} />);

    const dashboardElement = screen.getByTestId("nav-item-dashboard");
    expect(dashboardElement.getAttribute("data-active")).toBe("true");
  });

  /**
   * Property: Active state is consistent in collapsed mode
   */
  it("Property: Active state is consistent in collapsed mode", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...allNavItems),
        fc.boolean(),
        (activeNavItem, collapsed) => {
          cleanup();
          setMockPathname(activeNavItem.href);
          localStorage.setItem("sidebar-collapsed", String(collapsed));

          render(<Sidebar navGroups={testNavGroups} />);

          const navElement = screen.getByTestId(`nav-item-${activeNavItem.id}`);
          expect(navElement.getAttribute("data-active")).toBe("true");
        }
      ),
      { numRuns: 100 }
    );
  });
});
