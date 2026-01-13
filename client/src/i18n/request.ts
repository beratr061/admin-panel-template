import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  // Get locale from cookie, fallback to default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Validate locale
  const locale = locales.includes(localeCookie as Locale) 
    ? (localeCookie as Locale) 
    : defaultLocale;

  return {
    locale,
    timeZone: 'Europe/Istanbul',
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
