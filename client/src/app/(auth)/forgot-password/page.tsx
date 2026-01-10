'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm, type ForgotPasswordFormData } from '@/components/forms';
import apiClient from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success('Şifre sıfırlama bağlantısı gönderildi!');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Email Gönderildi</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">{submittedEmail}</span> adresine
            şifre sıfırlama bağlantısı gönderdik.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            Email&apos;inizi kontrol edin ve şifrenizi sıfırlamak için bağlantıya tıklayın.
            Email&apos;i göremiyorsanız spam klasörünü kontrol edin.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Giriş sayfasına dön
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Şifremi Unuttum</CardTitle>
        <CardDescription>
          Şifrenizi sıfırlamak için email adresinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Giriş sayfasına dön
        </Link>
      </CardFooter>
    </Card>
  );
}
