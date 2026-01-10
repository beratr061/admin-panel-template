"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeHref?: string;
  showHome?: boolean;
  className?: string;
  separator?: React.ReactNode;
}

// Route label mappings for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  roles: "Roles",
  settings: "Settings",
  profile: "Profile",
  create: "Create",
  edit: "Edit",
  new: "New",
};

/**
 * Generates breadcrumb items from the current pathname
 */
export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip dynamic segments that look like IDs (UUIDs, numbers, etc.)
    const isId = /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);

    if (isId) {
      // For IDs, we might want to show "Details" or skip
      items.push({
        label: "Details",
        href: i === segments.length - 1 ? undefined : currentPath,
      });
    } else {
      const label = routeLabels[segment.toLowerCase()] || 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      items.push({
        label,
        href: i === segments.length - 1 ? undefined : currentPath,
      });
    }
  }

  return items;
}

export function Breadcrumb({
  items: providedItems,
  homeHref = "/dashboard",
  showHome = true,
  className,
  separator,
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Use provided items or generate from pathname
  const items = React.useMemo(() => {
    if (providedItems) return providedItems;
    return generateBreadcrumbsFromPath(pathname);
  }, [providedItems, pathname]);

  // Don't render if we're on the home page and there are no items
  if (items.length === 0 && pathname === homeHref) {
    return null;
  }

  const separatorElement = separator || (
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center gap-1.5">
        {/* Home Link */}
        {showHome && (
          <>
            <li>
              <Link
                href={homeHref}
                className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                data-testid="breadcrumb-home"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            {items.length > 0 && (
              <li className="flex items-center" aria-hidden="true">
                {separatorElement}
              </li>
            )}
          </>
        )}

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    data-testid={`breadcrumb-item-${index}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                    aria-current={isLast ? "page" : undefined}
                    data-testid={`breadcrumb-item-${index}`}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li className="flex items-center" aria-hidden="true">
                  {separatorElement}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook for programmatic breadcrumb management
export function useBreadcrumbs() {
  const pathname = usePathname();
  const items = React.useMemo(
    () => generateBreadcrumbsFromPath(pathname),
    [pathname]
  );

  return { items, pathname };
}
