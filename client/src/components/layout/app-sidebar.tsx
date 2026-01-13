"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  Shield,
  Settings,
  LifeBuoy,
  BarChart3,
  PieChart,
  UserCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";
import { MobileNavigationHeader } from "@/components/application/app-navigation/base-components/mobile-header";
import type { NavItemType, NavItemDividerType } from "@/components/application/app-navigation/config";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";
import { cx } from "@/lib/utils/cx";

// Navigation items
const mainNavItems: (NavItemType | NavItemDividerType)[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Profile", href: "/profile", icon: UserCircle },
    ],
  },
  { divider: true },
  {
    label: "Management",
    href: "/users",
    icon: Users,
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Roles", href: "/roles", icon: Shield },
    ],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    items: [
      { label: "Overview", href: "/analytics", icon: PieChart },
      { label: "Reports", href: "/analytics/reports", icon: BarChart3 },
    ],
  },
];

const footerNavItems: (NavItemType | NavItemDividerType)[] = [
  { divider: true },
  {
    label: "Support",
    href: "/support",
    icon: LifeBuoy,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { can } = usePermission();

  // Filter items based on permissions
  const filteredMainItems = mainNavItems.filter((item) => {
    if ("divider" in item && item.divider) return true;
    if (!item.href) return true;
    
    // Check permission based on href
    if (item.href === "/users" && !can("users.read")) return false;
    if (item.href === "/roles" && !can("roles.read")) return false;
    
    return true;
  });

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-primary">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-secondary px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold text-primary">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <NavList items={filteredMainItems} activeUrl={pathname} />
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-secondary">
        <NavList items={footerNavItems} activeUrl={pathname} className="mt-0" />
        
        {/* User Info & Logout */}
        {user && (
          <div className="border-t border-secondary p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary_hover text-sm font-medium text-secondary">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
                <p className="truncate text-xs text-tertiary">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-md text-fg-quaternary transition hover:bg-primary_hover hover:text-fg-secondary"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <MobileNavigationHeader>
        <SidebarContent />
      </MobileNavigationHeader>

      {/* Desktop Sidebar */}
      <aside
        className={cx(
          "hidden h-screen w-64 shrink-0 border-r border-secondary lg:block",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
