"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useAuth } from "@/hooks/use-auth";

export interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function Header({
  onMenuClick,
  showMenuButton = false,
  className,
}: HeaderProps) {
  const { user, logout, isLogoutLoading } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get user initials for avatar fallback
  const userInitials = React.useMemo(() => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }, [user?.name]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality can be implemented here
    console.log("Search:", searchQuery);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      data-testid="header"
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
        className
      )}
    >
      {/* Mobile Menu Button */}
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          data-testid="mobile-menu-button"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 md:max-w-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            data-testid="search-input"
          />
        </div>
      </form>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <AnimatedThemeToggler />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          data-testid="notifications-button"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Notification badge can be added here */}
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
              data-testid="user-menu-button"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={user?.avatar || undefined}
                  alt={user?.name || "User"}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLogoutLoading ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
