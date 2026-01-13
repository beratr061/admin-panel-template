"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  LifeBuoy,
  Home,
  BarChart3,
  FolderKanban,
  CheckSquare,
  PieChart,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/use-permission";

export interface NavSubItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
  permission?: string;
}

export interface NavItemType {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  permission?: string;
  items?: NavSubItem[];
}

interface SidebarSlimProps {
  items?: NavItemType[];
  footerItems?: NavItemType[];
  logo?: React.ReactNode;
  className?: string;
}

const defaultNavItems: NavItemType[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Users", href: "/users", icon: Users, permission: "users.read" },
      { label: "Roles", href: "/roles", icon: Shield, permission: "roles.read" },
    ],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/dashboard/analytics", icon: PieChart },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    badge: 5,
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    permission: "users.read",
  },
];

const defaultFooterItems: NavItemType[] = [
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

export function SidebarSlim({
  items = defaultNavItems,
  footerItems = defaultFooterItems,
  logo,
  className,
}: SidebarSlimProps) {
  const pathname = usePathname();
  const { can } = usePermission();
  const [activeItem, setActiveItem] = React.useState<NavItemType | null>(null);
  const [isSecondaryOpen, setIsSecondaryOpen] = React.useState(false);

  // Filter items based on permissions
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (!item.permission) return true;
      return can(item.permission);
    }).map((item) => ({
      ...item,
      items: item.items?.filter((subItem) => {
        if (!subItem.permission) return true;
        return can(subItem.permission);
      }),
    }));
  }, [items, can]);

  const filteredFooterItems = React.useMemo(() => {
    return footerItems.filter((item) => {
      if (!item.permission) return true;
      return can(item.permission);
    });
  }, [footerItems, can]);

  // Check if a nav item is active
  const isActive = React.useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/";
      }
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  const handleItemClick = (item: NavItemType) => {
    if (item.items && item.items.length > 0) {
      if (activeItem?.href === item.href && isSecondaryOpen) {
        setIsSecondaryOpen(false);
        setActiveItem(null);
      } else {
        setActiveItem(item);
        setIsSecondaryOpen(true);
      }
    } else {
      setIsSecondaryOpen(false);
      setActiveItem(null);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex h-full", className)}>
        {/* Primary Slim Sidebar */}
        <aside
          data-testid="sidebar-slim"
          className="relative flex h-full w-16 flex-col border-r bg-sidebar text-sidebar-foreground"
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b">
            {logo ? (
              logo
            ) : (
              <Link href="/" className="flex items-center justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
              </Link>
            )}
          </div>

          {/* Main Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col items-center gap-1 px-2">
              {filteredItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const hasSubItems = item.items && item.items.length > 0;
                const isExpanded = activeItem?.href === item.href && isSecondaryOpen;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {hasSubItems ? (
                        <button
                          onClick={() => handleItemClick(item)}
                          data-testid={`nav-item-${item.label.toLowerCase()}`}
                          data-active={active || isExpanded}
                          className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                            active || isExpanded
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.badge && (
                            <Badge
                              variant="destructive"
                              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <span className="sr-only">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => handleItemClick(item)}
                          data-testid={`nav-item-${item.label.toLowerCase()}`}
                          data-active={active}
                          className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.badge && (
                            <Badge
                              variant="destructive"
                              className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[10px]"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <span className="sr-only">{item.label}</span>
                        </Link>
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer Navigation */}
          <div className="border-t py-4">
            <nav className="flex flex-col items-center gap-1 px-2">
              {filteredFooterItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        data-testid={`nav-footer-${item.label.toLowerCase()}`}
                        data-active={active}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Secondary Panel (Sub-items) */}
        <aside
          className={cn(
            "h-full w-56 border-r bg-sidebar/50 transition-all duration-300 overflow-hidden",
            isSecondaryOpen ? "opacity-100" : "w-0 opacity-0"
          )}
        >
          {activeItem && (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center gap-2 border-b px-4">
                <activeItem.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">{activeItem.label}</span>
              </div>

              {/* Sub Items */}
              <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                  {activeItem.items?.map((subItem) => {
                    const active = isActive(subItem.href);
                    const SubIcon = subItem.icon;

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {SubIcon && <SubIcon className="h-4 w-4" />}
                        <span className="flex-1">{subItem.label}</span>
                        {subItem.badge && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {subItem.badge}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 opacity-50" />
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>
            </div>
          )}
        </aside>
      </div>
    </TooltipProvider>
  );
}
