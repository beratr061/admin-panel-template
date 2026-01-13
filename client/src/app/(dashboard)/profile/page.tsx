"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Lock, Save } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth, authKeys } from "@/hooks/use-auth";
import apiClient from "@/lib/api-client";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(1, "Ad soyad zorunludur"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string().min(1, "Şifre tekrarı zorunludur"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

// Update profile
async function updateProfile(data: ProfileFormData): Promise<void> {
  await apiClient.put("/auth/profile", data);
}

// Change password
async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  await apiClient.put("/auth/password", data);
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, isLoading: isUserLoading } = useAuth();

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Initialize profile form with user data
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, profileForm]);

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profil başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Profil güncellenirken bir hata oluştu";
      toast.error(message);
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Şifre başarıyla değiştirildi");
      passwordForm.reset();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Şifre değiştirilirken bir hata oluştu";
      toast.error(message);
    },
  });

  // Handle profile submit
  const onProfileSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  // Handle password submit
  const onPasswordSubmit = (data: PasswordFormData) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Hesap bilgilerinizi yönetin
        </p>
      </div>

      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Kişisel Bilgiler</CardTitle>
          </div>
          <CardDescription>
            Temel hesap bilgilerinizi güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator />

            {/* Roles display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Roller</label>
              <div className="flex flex-wrap gap-1">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, index) => (
                    <Badge key={role.id || index} variant="secondary">
                      {role.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Rol atanmamış</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Ad Soyad
              </label>
              <Input
                id="name"
                placeholder="Ad Soyad"
                {...profileForm.register("name")}
              />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-posta
              </label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                {...profileForm.register("email")}
              />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {profileForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={profileMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {profileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Şifre Değiştir</CardTitle>
          </div>
          <CardDescription>
            Hesap şifrenizi güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Mevcut Şifre
              </label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Yeni Şifre
              </label>
              <Input
                id="newPassword"
                type="password"
                placeholder="En az 6 karakter"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Yeni Şifre Tekrar
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={passwordMutation.isPending}>
              <Lock className="mr-2 h-4 w-4" />
              {passwordMutation.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
