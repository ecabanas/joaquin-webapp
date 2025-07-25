
import { LandingPage } from '@/components/landing-page';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary flex-shrink-0" />
            <span className="font-bold text-xl tracking-tight">Joaquin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <LandingPage />
      </main>
      <footer className="bg-muted">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by you, powered by AI.
            </p>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Joaquin. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
