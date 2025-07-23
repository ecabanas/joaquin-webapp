'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  History,
  List,
  Settings,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/list', icon: List, label: 'List' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 flex items-center gap-3 border-b">
        <Logo className="w-7 h-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">Aisle Together</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
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
      <div className="p-4 mt-auto border-t">
        <Button variant="outline" className="w-full justify-start gap-3">
          <Users className="w-5 h-5" />
          Share List
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-muted/40">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:block md:w-64 lg:w-72 border-r">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col">
        {/* --- Mobile Header --- */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Aisle Together</span>
          </div>
           <Button variant="ghost" size="icon">
            <Users className="w-5 h-5" />
          </Button>
        </header>

        {/* Add padding-bottom to account for the mobile nav bar height */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      
      {/* --- Mobile Bottom Tab Bar --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t shadow-lg z-50">
        <div className="h-full grid grid-cols-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:bg-accent/50'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
