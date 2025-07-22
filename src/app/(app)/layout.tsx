'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  History,
  Home,
  Menu,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/list', icon: ShoppingCart, label: 'Grocery List' },
  { href: '/history', icon: History, label: 'Purchase History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2">
        <Logo className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold">Aisle Together</h1>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-2"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Users className="w-5 h-5" />
          Share List
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex">
      <aside className="hidden md:block md:w-64 lg:w-72 border-r bg-card">
        <NavContent />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="font-bold">Aisle Together</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
