
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/contexts/auth-context';
import { CurrencyProvider } from '@/hooks/use-currency';
import { AnalyticsProvider } from '@/contexts/analytics-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Joaquin | Shared Lists, Simplified',
  description: 'The intelligent, collaborative grocery list that helps you shop smarter, not harder. Analyze receipts with AI, track spending, and never forget the milk again.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <AuthProvider>
          <AnalyticsProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </AnalyticsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
