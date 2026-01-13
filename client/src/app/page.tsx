"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "./(dashboard)/layout";
import DashboardPage from "./(dashboard)/page";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const t = useTranslations();
  const router = useRouter();

  const handleLogin = () => {
    console.log('Login button clicked');
    window.location.href = '/login';
  };

  const handleRegister = () => {
    console.log('Register button clicked');
    window.location.href = '/register';
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, show dashboard with layout
  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  // If not authenticated, show landing page
  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-end mb-8">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel Template</CardTitle>
            <CardDescription>
              Full-Stack Admin Panel with Next.js, NestJS, and PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This template includes theme support, authentication, role-based access control, 
              and many more features to help you build admin panels quickly.
            </p>
            <div className="flex gap-4">
              <Button type="button" onClick={handleLogin}>
                {t('auth.login')}
              </Button>
              <Button type="button" variant="outline" onClick={handleRegister}>
                {t('auth.register')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
