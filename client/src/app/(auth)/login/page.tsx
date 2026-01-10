'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm, type LoginFormData } from '@/components/forms';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoginLoading } = useAuth();

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success('Giriş başarılı!');
      router.push('/');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yaparak devam edin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm onSubmit={handleSubmit} isLoading={isLoginLoading} />
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Link
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Şifrenizi mi unuttunuz?
        </Link>
        <div className="text-sm text-muted-foreground">
          Hesabınız yok mu?{' '}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Kayıt Ol
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
