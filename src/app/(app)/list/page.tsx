
'use client';

import { GroceryListClient } from '@/components/grocery-list-client';
import { mockActiveList } from '@/lib/mock-data';
import type { GroceryList, ListItem } from '@/lib/types';
import { useMemo, useState } from 'react';

export default function GroceryListPage() {
  // In a real app, you'd fetch this data from your database.
  const [activeList, setActiveList] = useState<GroceryList>(mockActiveList);

  const { totalItems, checkedItems } = useMemo(() => {
    return {
      totalItems: activeList.items.length,
      checkedItems: activeList.items.filter((item) => item.checked).length,
    };
  }, [activeList]);

  const progressValue = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  const allItemsComplete = totalItems > 0 && checkedItems === totalItems;
  
  const handleItemsChange = (items: ListItem[]) => {
    setActiveList(prev => ({...prev, items}));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="space-y-1.5 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-center">Grocery List</h1>
        <div className="h-10 flex items-center justify-center">
            {allItemsComplete ? (
              <p className="text-center text-lg font-medium text-primary animate-in fade-in-25">
                You've got everything! 🎉
              </p>
            ) : (
               <p className="text-muted-foreground text-center">
                A shared list to keep your shopping organized.
              </p>
            )}
        </div>
      </header>
      <GroceryListClient 
        list={activeList} 
        onItemsChange={handleItemsChange} 
        progress={progressValue} 
      />
    </div>
  );
}
