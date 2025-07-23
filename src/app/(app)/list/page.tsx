
'use client';

import { GroceryListClient } from '@/components/grocery-list-client';
import { mockActiveList, mockHistory, defaultCatalog } from '@/lib/mock-data';
import type { GroceryList, ListItem, Purchase } from '@/lib/types';
import { useMemo, useState } from 'react';
import { GlobalSearchInput } from '@/components/global-search-input';
import Fuse from 'fuse.js';

export default function GroceryListPage() {
  const [activeList, setActiveList] = useState<GroceryList>(mockActiveList);
  const [history, setHistory] = useState<Purchase[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleAddItem = (itemName: string) => {
    const itemNameLower = itemName.toLowerCase();
    const existingItem = activeList.items.find(item => item.name.toLowerCase() === itemNameLower);

    if (existingItem) {
        // If item is already on list, uncheck it and increment quantity
       const newItems = activeList.items.map(item => 
         item.id === existingItem.id 
         ? { ...item, quantity: item.quantity + 1, checked: false } 
         : item
       );
       handleItemsChange(newItems);
    } else {
      // If item does not exist, add it
      const newItem: ListItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        name: itemName.trim(),
        quantity: 1,
        checked: false,
      };
      handleItemsChange([...activeList.items, newItem]);
    }
  };

  const handleFinishShopping = (storeName: string) => {
    const checkedItemsList = activeList.items.filter(item => item.checked);
    const uncheckedItems = activeList.items.filter(item => !item.checked);

    if (checkedItemsList.length > 0) {
      const newPurchase: Purchase = {
        id: `purchase-${Date.now()}`,
        date: new Date(),
        store: storeName,
        completedBy: 'Jane Doe',
        items: checkedItemsList.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: Number((Math.random() * 10 + 1).toFixed(2)), // Mock price
        })),
      };
      
      setHistory(prevHistory => [newPurchase, ...prevHistory]);
    }

    setActiveList(prev => ({
      ...prev,
      items: uncheckedItems,
    }));

    console.log(`New purchase at ${storeName} added to history.`);
  };

  const searchPool = useMemo(() => {
    const combined = new Set([...defaultCatalog, ...activeList.items.map(i => i.name)]);
    return Array.from(combined);
  }, [activeList.items]);

  const fuse = useMemo(() => {
    return new Fuse(searchPool, {
      includeScore: true,
      threshold: 0.4,
    });
  }, [searchPool]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    
    const fuseResults = fuse.search(searchQuery).map(result => result.item);
    
    const uniqueResults = Array.from(new Set(fuseResults));
    
    const existingLower = activeList.items.map(i => i.name.toLowerCase());
    const finalResults = uniqueResults.filter(item => !existingLower.includes(item.toLowerCase()));

    return finalResults;
  }, [searchQuery, fuse, activeList.items]);


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
      
      <GlobalSearchInput
        placeholder="Search to add an item..."
        onSearchChange={setSearchQuery}
        suggestions={searchResults}
        onSelectSuggestion={handleAddItem}
        showBackdrop={true}
      />
      
      <div className="mt-4">
        <GroceryListClient 
          list={activeList} 
          onItemsChange={handleItemsChange} 
          onFinishShopping={handleFinishShopping}
          progress={progressValue} 
          onAddItem={handleAddItem}
        />
      </div>
    </div>
  );
}
