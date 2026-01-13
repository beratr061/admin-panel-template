"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Bell, Globe, Moon, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Uygulama tercihlerinizi yönetin
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Görünüm
            </CardTitle>
            <CardDescription>
              Tema ve görünüm ayarlarını özelleştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Açık, koyu veya sistem temasını seçin
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Dil
            </CardTitle>
            <CardDescription>
              Uygulama dilini değiştirin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dil Seçimi</Label>
                <p className="text-sm text-muted-foreground">
                  Tercih ettiğiniz dili seçin
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirimler
            </CardTitle>
            <CardDescription>
              Bildirim tercihlerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-posta Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">
                  Önemli güncellemeler için e-posta alın
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tarayıcı Bildirimleri</Label>
                <p className="text-sm text-muted-foreground">
                  Anlık bildirimler alın
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Güvenlik
            </CardTitle>
            <CardDescription>
              Hesap güvenliği ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>İki Faktörlü Doğrulama</Label>
                <p className="text-sm text-muted-foreground">
                  Hesabınıza ekstra güvenlik katmanı ekleyin
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Oturum Zaman Aşımı</Label>
                <p className="text-sm text-muted-foreground">
                  30 dakika hareketsizlik sonrası otomatik çıkış
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
