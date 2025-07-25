
'use client';

import { useState, useEffect } from 'react';
import type { Purchase } from '@/lib/types';
import { getPurchaseHistory } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';

export default function AnalyticsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const workspaceId = userProfile?.workspaceId;

  useEffect(() => {
    if (!workspaceId) {
      if (!authLoading) {
        setDataLoading(false);
      }
      return;
    };

    setDataLoading(true);
    const unsubscribe = getPurchaseHistory(workspaceId, (newPurchases) => {
      setPurchases(newPurchases);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [workspaceId, authLoading]);

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <header className="space-y-1.5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Shopping Story</h1>
        <p className="text-muted-foreground">
          Insights into your spending, habits, and favorite items.
        </p>
      </header>

      <AnalyticsDashboard purchases={purchases} />
    </div>
  );
}
