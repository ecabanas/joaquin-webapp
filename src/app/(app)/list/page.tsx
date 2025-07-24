
'use client';

import { GroceryListClient } from '@/components/grocery-list-client';
import type { GroceryList, ListItem, Purchase } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { GlobalSearchInput } from '@/components/global-search-input';
import Fuse from 'fuse.js';
import { addListItem, finishShopping, getListItems, updateListItem } from '@/lib/firestore';

const WORKSPACE_ID = 'workspace-1'; // Hardcoded for now

export default function GroceryListPage() {
  const [activeList, setActiveList] = useState<GroceryList>({ id: WORKSPACE_ID, items: []});
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultCatalog, setDefaultCatalog] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to real-time updates from Firestore
    const unsubscribe = getListItems(WORKSPACE_ID, (items) => {
      setActiveList({ id: WORKSPACE_ID, items });
    });

    // Unsubscribe on component unmount
    return () => unsubscribe();
  }, []);


  const { totalItems, checkedItems } = useMemo(() => {
    return {
      totalItems: activeList.items.length,
      checkedItems: activeList.items.filter((item) => item.checked).length,
    };
  }, [activeList]);

  const progressValue = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  const allItemsComplete = totalItems > 0 && checkedItems === totalItems;

  const handleItemsChange = (items: ListItem[]) => {
    // This function is now primarily for batch updates if ever needed,
    // but individual updates are handled by more specific functions.
    // For now, we can use updateListItem for individual changes.
    // The main listener will update the state.
  };
  
  const handleItemUpdate = (itemId: string, updates: Partial<ListItem>) => {
    updateListItem(WORKSPACE_ID, itemId, updates);
  };

  const handleAddItem = async (itemName: string) => {
    const itemNameLower = itemName.toLowerCase();
    const existingItem = activeList.items.find(item => item.name.toLowerCase() === itemNameLower);

    if (existingItem) {
        // If item is already on list, uncheck it and increment quantity
       await updateListItem(WORKSPACE_ID, existingItem.id, {
         quantity: existingItem.quantity + 1,
         checked: false,
       });
    } else {
      // If item does not exist, add it
      const newItem: Omit<ListItem, 'id'> = {
        name: itemName.trim(),
        quantity: 1,
        checked: false,
      };
      await addListItem(WORKSPACE_ID, newItem);
    }
  };

  const handleFinishShopping = async (storeName: string) => {
    await finishShopping(WORKSPACE_ID, storeName, 'Jane Doe');
    console.log(`New purchase at ${storeName} added to history.`);
  };

  const searchPool = useMemo(() => {
    const combined = new Set([...defaultCatalog, ...activeList.items.map(i => i.name)]);
    return Array.from(combined);
  }, [activeList.items, defaultCatalog]);

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
          onItemUpdate={handleItemUpdate}
          onFinishShopping={handleFinishShopping}
          progress={progressValue} 
          onAddItem={handleAddItem}
        />
      </div>
    </div>
  );
}
