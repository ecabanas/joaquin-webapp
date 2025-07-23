
'use client';

import { GroceryListClient } from '@/components/grocery-list-client';
import { mockActiveList, mockHistory } from '@/lib/mock-data';
import type { GroceryList, ListItem, Purchase } from '@/lib/types';
import { useMemo, useState } from 'react';

export default function GroceryListPage() {
  // In a real app, this data would come from a database.
  // For this prototype, we manage state in this component.
  const [activeList, setActiveList] = useState<GroceryList>(mockActiveList);
  const [history, setHistory] = useState<Purchase[]>(mockHistory);

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

  const handleFinishShopping = (storeName: string) => {
    const checkedItems = activeList.items.filter(item => item.checked);
    const uncheckedItems = activeList.items.filter(item => !item.checked);

    // 1. Create a new purchase record for the history
    if (checkedItems.length > 0) {
      const newPurchase: Purchase = {
        id: `purchase-${Date.now()}`,
        date: new Date(),
        store: storeName,
        completedBy: 'Jane Doe', // In a real app, this would be the logged-in user
        items: checkedItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: Number((Math.random() * 10 + 1).toFixed(2)), // Mock price
        })),
      };
      
      // Add the new purchase to the beginning of the history array
      setHistory(prevHistory => [newPurchase, ...prevHistory]);
    }

    // 2. Create the new active list with only the unchecked items
    setActiveList(prev => ({
      ...prev,
      items: uncheckedItems,
    }));

    // In a real app, you'd also need to update the history page data.
    // For this prototype, we'll just log it. The history page still uses static mock data.
    console.log(`New purchase at ${storeName} added to history.`);
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
        onFinishShopping={handleFinishShopping}
        progress={progressValue} 
      />
    </div>
  );
}
