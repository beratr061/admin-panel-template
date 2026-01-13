"use client";

import * as React from "react";
import { SidebarSlim } from "@/components/layout/sidebar-slim";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  LifeBuoy,
  Home,
  BarChart3,
  PieChart,
  UserCircle,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Profile", href: "/profile", icon: UserCircle },
    ],
  },
  {
    label: "Management",
    href: "/users",
    icon: Users,
    items: [
      { label: "Users", href: "/users", icon: Users, permission: "users.read" },
      { label: "Roles", href: "/roles", icon: Shield, permission: "roles.read" },
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

const footerItems = [
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SidebarSlim items={navItems} footerItems={footerItems} />
      <div className="flex flex-1 flex-col">
        <Header user={null} />
        <main className="flex-1 bg-muted/30 p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
