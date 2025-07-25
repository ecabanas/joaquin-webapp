
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Joaquin | Shared Lists, Simplified',
  description: 'The intelligent, collaborative grocery list that helps you shop smarter, not harder. Analyze receipts with AI, track spending, and never forget the milk again.',
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.variable
      )}
    >
      {children}
      <Toaster />
    </div>
  );
}
