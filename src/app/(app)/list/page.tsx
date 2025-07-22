
'use client';

import { GroceryListClient } from '@/components/grocery-list-client';
import { Progress } from '@/components/ui/progress';
import { mockAisles } from '@/lib/mock-data';
import type { Aisle } from '@/lib/types';
import { useMemo, useState } from 'react';

export default function GroceryListPage() {
  // In a real app, you'd fetch this data from your database.
  const [aisles, setAisles] = useState<Aisle[]>(mockAisles);

  const { totalItems, checkedItems } = useMemo(() => {
    const allItems = aisles.flatMap((aisle) => aisle.items);
    return {
      totalItems: allItems.length,
      checkedItems: allItems.filter((item) => item.checked).length,
    };
  }, [aisles]);

  const progressValue = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  const allItemsComplete = totalItems > 0 && checkedItems === totalItems;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="space-y-1.5 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-center">Grocery List</h1>
        <div className="h-10 flex items-center justify-center">
            {totalItems > 0 ? (
              <div className="w-full max-w-sm mx-auto">
                {allItemsComplete ? (
                  <p className="text-center text-lg font-medium text-primary animate-in fade-in-25">
                    You've got everything! 🎉
                  </p>
                ) : (
                  <div className="animate-in fade-in-25 relative flex items-center justify-center">
                     <Progress value={progressValue} className="h-6 w-full rounded-full bg-card/50 backdrop-blur-sm border" />
                     <span className="absolute text-xs font-semibold text-muted-foreground">
                       {checkedItems} / {totalItems}
                     </span>
                  </div>
                )}
              </div>
            ) : (
               <p className="text-muted-foreground text-center">
                A shared list to keep your shopping organized.
              </p>
            )}
        </div>
      </header>
      <GroceryListClient aisles={aisles} onAislesChange={setAisles} />
    </div>
  );
}
