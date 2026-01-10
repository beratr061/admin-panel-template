"use client";

import * as React from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { LineChart, BarChart, PieChart } from "@/components/dashboard/charts";
import { ActivityFeed, ActivityItem } from "@/components/dashboard/activity-feed";

// Sample data for demonstration
const lineChartData = [
  { name: "Jan", revenue: 4000, users: 2400 },
  { name: "Feb", revenue: 3000, users: 1398 },
  { name: "Mar", revenue: 2000, users: 9800 },
  { name: "Apr", revenue: 2780, users: 3908 },
  { name: "May", revenue: 1890, users: 4800 },
  { name: "Jun", revenue: 2390, users: 3800 },
];

const barChartData = [
  { name: "Mon", sales: 120, orders: 80 },
  { name: "Tue", sales: 150, orders: 100 },
  { name: "Wed", sales: 180, orders: 120 },
  { name: "Thu", sales: 140, orders: 90 },
  { name: "Fri", sales: 200, orders: 150 },
  { name: "Sat", sales: 250, orders: 180 },
  { name: "Sun", sales: 190, orders: 140 },
];

const pieChartData = [
  { name: "Desktop", value: 400, color: "hsl(var(--chart-1))" },
  { name: "Mobile", value: 300, color: "hsl(var(--chart-2))" },
  { name: "Tablet", value: 200, color: "hsl(var(--chart-3))" },
  { name: "Other", value: 100, color: "hsl(var(--chart-4))" },
];

const activityItems: ActivityItem[] = [
  {
    id: "1",
    user: { name: "John Doe", avatar: undefined },
    action: "created",
    target: "New Project",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    user: { name: "Jane Smith", avatar: undefined },
    action: "updated",
    target: "User Settings",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    user: { name: "Bob Wilson", avatar: undefined },
    action: "deleted",
    target: "Old Report",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    user: { name: "Alice Brown", avatar: undefined },
    action: "commented on",
    target: "Task #123",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Stats Grid */}
      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="stats-grid"
      >
        <StatCard
          title="Total Revenue"
          value="$45,231.89"
          icon={DollarSign}
          trend={{ value: 20.1, isPositive: true }}
          description="from last month"
        />
        <StatCard
          title="Subscriptions"
          value="+2,350"
          icon={Users}
          trend={{ value: 180.1, isPositive: true }}
          description="from last month"
        />
        <StatCard
          title="Sales"
          value="+12,234"
          icon={ShoppingCart}
          trend={{ value: 19, isPositive: true }}
          description="from last month"
        />
        <StatCard
          title="Active Now"
          value="+573"
          icon={Activity}
          trend={{ value: 4.5, isPositive: false }}
          description="from last hour"
        />
      </div>

      {/* Charts Grid */}
      <div
        className="grid gap-4 grid-cols-1 lg:grid-cols-2"
        data-testid="charts-grid"
      >
        <LineChart
          title="Revenue Overview"
          data={lineChartData}
          series={[
            { dataKey: "revenue", name: "Revenue", color: "hsl(var(--chart-1))" },
            { dataKey: "users", name: "Users", color: "hsl(var(--chart-2))" },
          ]}
        />
        <BarChart
          title="Weekly Sales"
          data={barChartData}
          series={[
            { dataKey: "sales", name: "Sales", color: "hsl(var(--chart-1))" },
            { dataKey: "orders", name: "Orders", color: "hsl(var(--chart-2))" },
          ]}
        />
      </div>

      {/* Bottom Grid */}
      <div
        className="grid gap-4 grid-cols-1 lg:grid-cols-3"
        data-testid="bottom-grid"
      >
        <PieChart
          title="Traffic Sources"
          data={pieChartData}
          donut
          className="lg:col-span-1"
        />
        <ActivityFeed
          items={activityItems}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
