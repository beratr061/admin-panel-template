"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Sidebar, useSidebarState, type NavGroup } from "./sidebar";
import { Header } from "./header";
import { Breadcrumb } from "./breadcrumb";
import { MobileNav } from "./mobile-nav";

// Default navigation configuration
const defaultNavGroups: NavGroup[] = [
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
        permission: "users.read",
      },
      {
        id: "roles",
        label: "Roles",
        icon: Shield,
        href: "/roles",
        permission: "roles.read",
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

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navGroups?: NavGroup[];
  logo?: React.ReactNode;
  showBreadcrumb?: boolean;
  className?: string;
}

export function DashboardLayout({
  children,
  navGroups = defaultNavGroups,
  logo,
  showBreadcrumb = true,
  className,
}: DashboardLayoutProps) {
  const { collapsed, toggle } = useSidebarState();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div
      className={cn("flex h-screen overflow-hidden bg-background", className)}
      data-testid="dashboard-layout"
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={toggle}
          navGroups={navGroups}
          logo={logo}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        navGroups={navGroups}
        logo={logo}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          showMenuButton={true}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            {/* Breadcrumb */}
            {showBreadcrumb && (
              <div className="mb-4">
                <Breadcrumb />
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Re-export types and components for convenience
export type { NavGroup, NavItem } from "./sidebar";
export { Sidebar, useSidebarState, SIDEBAR_STORAGE_KEY } from "./sidebar";
export { Header } from "./header";
export { Breadcrumb, generateBreadcrumbsFromPath, useBreadcrumbs } from "./breadcrumb";
export { MobileNav } from "./mobile-nav";
