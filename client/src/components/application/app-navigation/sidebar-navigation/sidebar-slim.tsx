"use client";

import type { FC, ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavItemType } from "../config";

interface SidebarNavigationSlimProps {
  /** Navigation items for the main section */
  items: (NavItemType & { icon: FC<{ className?: string }> })[];
  /** Navigation items for the footer section */
  footerItems?: (NavItemType & { icon: FC<{ className?: string }> })[];
  /** Logo component to display */
  logo?: ReactNode;
  /** Account card component to display at the bottom */
  accountCard?: ReactNode;
  /** Featured card component to display */
  featuredCard?: ReactNode;
  /** Additional class name */
  className?: string;
}

export const SidebarNavigationSlim = ({
  items,
  footerItems = [],
  logo,
  accountCard,
  featuredCard,
  className,
}: SidebarNavigationSlimProps) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<NavItemType | null>(null);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);

  // Find active item based on current path
  const findActiveItem = () => {
    for (const item of [...items, ...footerItems]) {
      if (item.href === pathname) return item;
      if (item.items?.some((sub) => sub.href === pathname)) return item;
    }
    return null;
  };

  const currentActiveItem = findActiveItem();

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleItemClick = (item: NavItemType & { icon: FC<{ className?: string }> }) => {
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

  const NavItem = ({
    item,
  }: {
    item: NavItemType & { icon: FC<{ className?: string }> };
  }) => {
    const Icon = item.icon;
    const active = isActive(item.href) || activeItem?.href === item.href;
    const hasSubItems = item.items && item.items.length > 0;

    const baseClasses = cn(
      "group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors",
      "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active && "bg-accent"
    );

    if (hasSubItems) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => handleItemClick(item)} className={baseClasses}>
              <Icon
                className={cn(
                  "size-5 text-muted-foreground transition-colors",
                  active && "text-foreground"
                )}
              />
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {item.badge}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href!}
            onClick={() => handleItemClick(item)}
            className={baseClasses}
          >
            <Icon
              className={cn(
                "size-5 text-muted-foreground transition-colors",
                active && "text-foreground"
              )}
            />
            {item.badge && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  const SidebarContent = () => (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full">
        {/* Primary Slim Sidebar */}
        <aside className="relative flex h-full w-[70px] flex-col border-r border-border bg-background">
          {/* Logo */}
          <div className="flex h-[72px] items-center justify-center border-b border-border">
            {logo || (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                A
              </div>
            )}
          </div>

          {/* Main Navigation */}
          <ScrollArea className="flex-1">
            <nav className="flex flex-col items-center gap-1 py-4">
              {items.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </nav>
          </ScrollArea>

          {/* Footer Navigation */}
          {footerItems.length > 0 && (
            <div className="border-t border-border py-4">
              <nav className="flex flex-col items-center gap-1">
                {footerItems.map((item) => (
                  <NavItem key={item.label} item={item} />
                ))}
              </nav>
            </div>
          )}

          {/* Account Card (Avatar only in slim mode) */}
          {accountCard && (
            <div className="border-t border-border p-3">{accountCard}</div>
          )}
        </aside>

        {/* Secondary Panel (Sub-items) */}
        <aside
          className={cn(
            "h-full w-[280px] border-r border-border bg-background transition-all duration-200 overflow-hidden",
            isSecondaryOpen ? "opacity-100" : "w-0 opacity-0 border-r-0"
          )}
        >
          {activeItem && (
            <div className="flex h-full w-[280px] flex-col">
              {/* Header */}
              <div className="flex h-[72px] items-center gap-3 border-b border-border px-6">
                {activeItem.icon && (
                  <activeItem.icon className="size-5 text-muted-foreground" />
                )}
                <span className="text-lg font-semibold text-foreground">
                  {activeItem.label}
                </span>
              </div>

              {/* Sub Items */}
              <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-4">
                  {activeItem.items?.map((subItem) => {
                    const active = isActive(subItem.href);
                    const SubIcon = subItem.icon;

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {SubIcon && (
                          <SubIcon
                            className={cn(
                              "size-5",
                              active ? "text-foreground" : "text-muted-foreground"
                            )}
                          />
                        )}
                        <span className="flex-1">{subItem.label}</span>
                        {subItem.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                            {subItem.badge}
                          </span>
                        )}
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              {/* Featured Card */}
              {featuredCard && <div className="p-4">{featuredCard}</div>}
            </div>
          )}
        </aside>
      </div>
    </TooltipProvider>
  );

  return (
    <div className={cn("hidden h-screen shrink-0 lg:flex", className)}>
      <SidebarContent />
    </div>
  );
};
