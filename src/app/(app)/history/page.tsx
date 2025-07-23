
'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GlobalSearchInput } from '@/components/global-search-input';
import { mockHistory } from "@/lib/mock-data";
import { ChevronDown, User, FileText } from 'lucide-react';
import type { Purchase } from '@/lib/types';
import { Button } from '@/components/ui/button';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function HistoryPage() {
  const [purchases] = useState<Purchase[]>(() => mockHistory.sort((a, b) => b.date.getTime() - a.date.getTime()));
  const [searchQuery, setSearchQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(purchases, {
      keys: ['store', 'items.name', 'completedBy', 'date'],
      includeScore: true,
      threshold: 0.3,
    });
  }, [purchases]);
  
  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, purchases, fuse]);


  const PurchaseCard = ({ purchase }: { purchase: Purchase }) => {
    const total = purchase.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
      <Collapsible defaultOpen={false}>
        <Card className="shadow-sm overflow-hidden">
          <CollapsibleTrigger className="w-full text-left group">
             <CardHeader className="flex flex-row items-start justify-between gap-4 p-4 md:p-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-xl">{purchase.store}</CardTitle>
                <CardDescription>{formatDate(purchase.date)}</CardDescription>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <User className="h-4 w-4" />
                  <span>{purchase.completedBy}</span>
                </div>
              </div>
               <div className="text-right flex flex-col items-end">
                  <p className="text-2xl font-bold">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-sm text-muted-foreground">{purchase.items.length} items</p>
                  <ChevronDown className="h-5 w-5 mt-2 transition-transform duration-300 group-data-[state=open]:rotate-180" />
               </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 md:p-6 pt-0">
               <div className="h-[1px] w-full mb-4" style={{ background: 'linear-gradient(to right, transparent, hsl(var(--border)), transparent)' }} />
              <ul className="space-y-3">
                {purchase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex justify-between items-center text-base">
                    <span className="text-foreground">{item.name} <span className="text-sm text-muted-foreground">(x{item.quantity})</span></span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="space-y-1.5 mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Purchase History</h1>
        <p className="text-muted-foreground">
          Review and search past shopping trips.
        </p>
      </header>
      
      <div className="relative mb-6">
        <GlobalSearchInput
          placeholder="Search by store, item, user, or date..."
          onSearchChange={setSearchQuery}
          suggestions={[]}
          onSelectSuggestion={() => {}}
          showBackdrop={false}
        />
      </div>

      <div className="grid gap-4">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))
        ) : (
          <div className="text-center py-16 px-4 bg-card rounded-lg border border-dashed">
             <FileText className="mx-auto h-12 w-12 text-primary/40" strokeWidth={1.5} />
            <h3 className="mt-4 text-xl font-semibold text-foreground">No Purchases Found</h3>
            <p className="mt-1 text-muted-foreground">
              Your search for "{searchQuery}" did not match any past purchases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
