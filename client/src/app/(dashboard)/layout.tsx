"use client";

import * as React from "react";
import type { FC } from "react";
import Link from "next/link";
import {
  BarChart3,
  CheckSquare,
  Home,
  LifeBuoy,
  PieChart,
  Settings,
  Users,
  Shield,
  User,
  LayoutGrid,
  LineChart,
  Settings2,
} from "lucide-react";
import { SidebarNavigationSlim } from "@/components/application/app-navigation/sidebar-navigation/sidebar-slim";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { useAuth } from "@/hooks/use-auth";

const navItems: (NavItemType & { icon: FC<{ className?: string }> })[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid },
      { label: "Profile", href: "/profile", icon: User },
    ],
  },
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
      { label: "Reports", href: "/analytics/reports", icon: LineChart },
      { label: "Settings", href: "/analytics/settings", icon: Settings2 },
    ],
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    badge: 5,
  },
  {
    label: "Reporting",
    href: "/reporting",
    icon: PieChart,
  },
];

const footerItems: (NavItemType & { icon: FC<{ className?: string }> })[] = [
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

function UserAvatar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <button
      onClick={() => logout()}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground transition hover:bg-accent"
      title="Çıkış Yap"
    >
      {user.name?.charAt(0).toUpperCase() || "U"}
    </button>
  );
}

function Logo() {
  return (
    <Link
      href="/dashboard"
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg transition hover:opacity-90"
    >
      A
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <SidebarNavigationSlim
        items={navItems}
        footerItems={footerItems}
        logo={<Logo />}
        accountCard={<UserAvatar />}
      />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-muted/30 p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
