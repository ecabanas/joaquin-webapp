
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/list', icon: List, label: 'List' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const SidebarContent = () => (
     <TooltipProvider delayDuration={0}>
        <div className="group flex flex-col h-full bg-card rounded-2xl border shadow-lg transition-all duration-300 ease-in-out overflow-hidden">
          <div className="p-3 flex items-center justify-center gap-3 border-b h-16">
            <Logo className="w-7 h-7 text-primary flex-shrink-0" />
            <h1 className="text-xl font-bold tracking-tight truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">Aisle Together</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                   <Button
                    variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-center group-hover:justify-start h-12 gap-3 px-4 text-base"
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="w-6 h-6 flex-shrink-0" />
                      <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.label}</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                 <TooltipContent side="right" className="flex items-center gap-4 group-hover:hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <div className="p-2 mt-auto border-t">
             <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="w-full justify-center group-hover:justify-start h-12 gap-3 px-4">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback><Users className="w-5 h-5" /></AvatarFallback>
                     </Avatar>
                     <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">Share List</span>
                  </Button>
                 </TooltipTrigger>
                 <TooltipContent side="right" className="flex items-center gap-4 group-hover:hidden">
                   Share List
                </TooltipContent>
              </Tooltip>
          </div>
        </div>
      </TooltipProvider>
  );

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-muted/40">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:block transition-all duration-300 ease-in-out w-24 group hover:w-64 p-3">
        <div className="h-full">
           <SidebarContent />
        </div>
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
