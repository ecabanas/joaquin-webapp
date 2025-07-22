'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  History,
  Menu,
  Settings,
  List,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/list', icon: List, label: 'Grocery List' },
  { href: '/history', icon: History, label: 'Purchase History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 flex items-center gap-3">
        <Logo className="w-7 h-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Aisle Together</h1>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
            className="w-full justify-start h-11 gap-3 px-4 text-base"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <div className="p-4 mt-auto">
        <Button variant="outline" className="w-full justify-start gap-3">
          <Users className="w-5 h-5" />
          Share List
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-muted/40">
      <aside className="hidden md:block md:w-64 lg:w-72 border-r">
        <NavContent />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Aisle Together</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
