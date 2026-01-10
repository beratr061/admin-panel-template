"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermission } from "@/hooks/use-permission";
import type { NavGroup } from "./sidebar";

export interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navGroups: NavGroup[];
  logo?: React.ReactNode;
}

export function MobileNav({
  open,
  onOpenChange,
  navGroups,
  logo,
}: MobileNavProps) {
  const pathname = usePathname();
  const { can } = usePermission();

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

  // Close the sheet when a link is clicked
  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 p-0"
        data-testid="mobile-nav-sheet"
      >
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            {logo ? (
              logo
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <span>Admin Panel</span>
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <nav className="space-y-4 p-4">
            {filteredNavGroups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={handleLinkClick}
                        data-testid={`mobile-nav-item-${item.id}`}
                        data-active={active}
                        className={cn(
                          "flex h-10 items-center gap-3 rounded-md px-3 transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
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
      </SheetContent>
    </Sheet>
  );
}
