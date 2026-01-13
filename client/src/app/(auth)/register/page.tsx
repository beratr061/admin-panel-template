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
import { RegisterForm, type RegisterFormData } from '@/components/forms';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isRegisterLoading } = useAuth();

  const handleSubmit = async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
    try {
      await register(data);
      toast.success('Kayıt başarılı!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Kayıt yapılırken bir hata oluştu';
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
        <CardDescription>
          Yeni bir hesap oluşturun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm onSubmit={handleSubmit} isLoading={isRegisterLoading} />
      </CardContent>
      <CardFooter className="justify-center">
        <div className="text-sm text-muted-foreground">
          Zaten hesabınız var mı?{' '}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Giriş Yap
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
