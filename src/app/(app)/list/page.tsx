
'use client';

import { GroceryListClient } from '@/components/grocery-list-client';
import type { GroceryList, ListItem } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { GlobalSearchInput } from '@/components/global-search-input';
import Fuse from 'fuse.js';
import { addListItem, finishShopping, getListItems, updateListItem, getItemCatalog, seedInitialCatalog } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function GroceryListPage() {
  const { user, userProfile, loading } = useAuth();
  const [activeList, setActiveList] = useState<GroceryList>({ id: '', items: []});
  const [searchQuery, setSearchQuery] = useState('');
  const [itemCatalog, setItemCatalog] = useState<string[]>([]);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const workspaceId = userProfile?.workspaceId;

  useEffect(() => {
    if (!workspaceId) return;

    // Subscribe to real-time updates for the grocery list
    const unsubscribeList = getListItems(workspaceId, (items) => {
      setActiveList({ id: workspaceId, items });
    });

    // Subscribe to real-time updates for the item catalog
    const unsubscribeCatalog = getItemCatalog(workspaceId, (catalog) => {
      // Seed initial data if catalog is empty
      if (catalog.length === 0) {
        seedInitialCatalog(workspaceId);
      }
      setItemCatalog(catalog);
    });

    // Unsubscribe on component unmount
    return () => {
      unsubscribeList();
      unsubscribeCatalog();
    };
  }, [workspaceId]);


  const { totalItems, checkedItems } = useMemo(() => {
    return {
      totalItems: activeList.items.length,
      checkedItems: activeList.items.filter((item) => item.checked).length,
    };
  }, [activeList]);

  const progressValue = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  
  const handleItemUpdate = (itemId: string, updates: Partial<ListItem>) => {
    if (!workspaceId) return;
    updateListItem(workspaceId, itemId, updates);
  };

  const handleAddItem = async (itemName: string) => {
    if (!workspaceId) return;
    const itemNameLower = itemName.toLowerCase();
    const existingItem = activeList.items.find(item => item.name.toLowerCase() === itemNameLower);

    if (existingItem) {
        // If item is already on list, uncheck it and increment quantity
       await updateListItem(workspaceId, existingItem.id, {
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
      await addListItem(workspaceId, newItem, itemCatalog);
    }
  };

  const handleFinishShopping = async () => {
    if (!workspaceId || !userProfile?.name) return;
    
    setIsFinishDialogOpen(false); // Close dialog immediately
    const newPurchaseId = await finishShopping(workspaceId, userProfile.name, activeList.items);
    
    if (newPurchaseId) {
      toast({
        title: 'List Archived!',
        description: 'Your purchased items have been moved to your history.',
        action: (
          <Button variant="secondary" size="sm" onClick={() => router.push(`/history?openPurchaseId=${newPurchaseId}`)}>
            View
          </Button>
        ),
      });
    }
  };

  const searchPool = useMemo(() => {
    const combined = new Set([...itemCatalog, ...activeList.items.map(i => i.name)]);
    return Array.from(combined);
  }, [activeList.items, itemCatalog]);

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

  if (loading || !workspaceId) {
     return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="space-y-1.5 mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Grocery Listtttttt</h1>
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
          onItemUpdate={onItemUpdate}
          onFinishShopping={handleFinishShopping}
          progress={progressValue} 
          isFinishDialogOpen={isFinishDialogOpen}
          setIsFinishDialogOpen={setIsFinishDialogOpen}
        />
      </div>
    </div>
  );
}
