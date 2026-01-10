"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermission } from "@/hooks/use-permission";

// Storage key for sidebar state persistence
const SIDEBAR_STORAGE_KEY = "sidebar-collapsed";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  permission?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

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

export interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  navGroups?: NavGroup[];
  logo?: React.ReactNode;
  className?: string;
}

export function Sidebar({
  collapsed: controlledCollapsed,
  onToggle: controlledOnToggle,
  navGroups = defaultNavGroups,
  logo,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const { can } = usePermission();

  // Internal state for uncontrolled mode
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored === "true";
    }
    return false;
  });

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  // Handle toggle
  const handleToggle = React.useCallback(() => {
    if (isControlled && controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalCollapsed((prev) => {
        const newValue = !prev;
        if (typeof window !== "undefined") {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newValue));
        }
        return newValue;
      });
    }
  }, [isControlled, controlledOnToggle]);

  // Persist state when controlled value changes
  React.useEffect(() => {
    if (isControlled && typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    }
  }, [collapsed, isControlled]);

  // Filter nav items based on permissions
  const filteredNavGroups = React.useMemo(() => {
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!item.permission) return true;
          return can(item.permission);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [navGroups, can]);

  // Check if a nav item is active
  const isActive = React.useCallback(
    (href: string) => {
      if (href === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        data-testid="sidebar"
        data-collapsed={collapsed}
        className={cn(
          "relative flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Logo/Brand */}
        <div
          className={cn(
            "flex h-16 items-center border-b px-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {logo ? (
            logo
          ) : (
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 font-semibold",
                collapsed && "justify-center"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-4 px-2">
            {filteredNavGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.title}
                  </h4>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    if (collapsed) {
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              data-testid={`nav-item-${item.id}`}
                              data-active={active}
                              className={cn(
                                "flex h-10 w-full items-center justify-center rounded-md transition-colors",
                                active
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              <span className="sr-only">{item.label}</span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        data-testid={`nav-item-${item.id}`}
                        data-active={active}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-md px-3 transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Toggle Button */}
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            data-testid="sidebar-toggle"
            className="w-full"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// Hook for managing sidebar state externally
export function useSidebarState(defaultCollapsed = false) {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        return stored === "true";
      }
    }
    return defaultCollapsed;
  });

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newValue));
      }
      return newValue;
    });
  }, []);

  const setCollapsedState = React.useCallback((value: boolean) => {
    setCollapsed(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
    }
  }, []);

  return { collapsed, toggle, setCollapsed: setCollapsedState };
}

export { SIDEBAR_STORAGE_KEY };
