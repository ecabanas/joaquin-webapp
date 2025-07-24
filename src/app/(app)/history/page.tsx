
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
import { ChevronDown, User, FileText, Loader2, ScanLine } from 'lucide-react';
import type { Purchase } from '@/lib/types';
import { getPurchaseHistory } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { ReceiptAnalyzer } from '@/components/receipt-analyzer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/use-currency';

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function HistoryPage() {
  const { userProfile, loading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceId = userProfile?.workspaceId;
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (!workspaceId) return;
    
    const unsubscribe = getPurchaseHistory(workspaceId, (purchases) => {
      setPurchases(purchases);
    });

    return () => unsubscribe();
  }, [workspaceId]);

  const searchableData = useMemo(() => {
    return purchases.map(purchase => ({
      ...purchase,
      searchableDate: formatDate(purchase.date),
    }));
  }, [purchases]);
  
  const fuse = useMemo(() => {
    return new Fuse(searchableData, {
      keys: ['store', 'items.name', 'completedBy', 'searchableDate'],
      includeScore: true,
      threshold: 0.3,
    });
  }, [searchableData]);
  
  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, purchases, fuse]);

  const handleAnalyzeClick = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    // Keep selected purchase ID, clear file, and re-trigger input
    setSelectedFile(null); 
    // A brief timeout allows the dialog to close before the file input is re-triggered
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedPurchaseId) {
      setSelectedFile(file);
    }
     // Reset file input to allow re-selection of the same file
    if(e.target) e.target.value = '';
  };

  const handleAnalyzerClose = () => {
    setSelectedFile(null);
    setSelectedPurchaseId(null);
  };


  if (loading || !workspaceId) {
     return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const PurchaseCard = ({ purchase }: { purchase: Purchase }) => {
    const total = purchase.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
    const hasPrices = purchase.items.some(item => (item.price || 0) > 0);

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
                    {hasPrices ? formatCurrency(total) : '---'}
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
                    <span className="font-medium">{hasPrices && item.price ? formatCurrency(item.price * item.quantity) : '---'}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            {!hasPrices && (
              <CardFooter className="px-4 pb-4 md:px-6 md:pb-6">
                <Button onClick={() => handleAnalyzeClick(purchase.id)}>
                   <ScanLine className="mr-2 h-4 w-4" /> Analyze Receipt
                </Button>
              </CardFooter>
            )}
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
              Your past shopping trips will appear here.
            </p>
          </div>
        )}
      </div>

       {/* Hidden file input, controlled by ref */}
      <Input
        type="file"
        accept="image/*"
        capture="environment" // Prioritize back camera
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Receipt Analyzer Dialog, controlled by state */}
      {selectedFile && selectedPurchaseId && (
        <ReceiptAnalyzer
          receiptFile={selectedFile}
          purchaseId={selectedPurchaseId}
          onDone={handleAnalyzerClose}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}
