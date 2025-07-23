
'use client';

import type { GroceryList, ListItem } from '@/lib/types';
import { useMemo } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { AddItemSearch } from './add-item-search';
import { cn } from '@/lib/utils';
import { defaultCatalog } from '@/lib/mock-data';
import { Progress } from './ui/progress';
import { FinishShoppingDialog } from './finish-shopping-dialog';

type GroceryListClientProps = {
  list: GroceryList;
  onItemsChange: (items: ListItem[]) => void;
  progress: number;
};

export function GroceryListClient({ list, onItemsChange, progress }: GroceryListClientProps) {

  const { checkedItems, uncheckedItems } = useMemo(() => {
    const sorted = [...list.items].sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      checkedItems: sorted.filter(item => item.checked),
      uncheckedItems: sorted.filter(item => !item.checked),
    }
  }, [list.items]);

  const handleItemCheckedChange = (
    itemId: string,
    checked: boolean
  ) => {
    const newItems = list.items.map((item) =>
      item.id === itemId ? { ...item, checked } : item
    );
    onItemsChange(newItems);
  };
  
  const handleAddItem = (itemName: string) => {
    const itemNameLower = itemName.toLowerCase();
    const existingItem = list.items.find(item => item.name.toLowerCase() === itemNameLower);

    if (existingItem) {
        // If item is already on list, uncheck it and increment quantity
       const newItems = list.items.map(item => 
         item.id === existingItem.id 
         ? { ...item, quantity: item.quantity + 1, checked: false } 
         : item
       );
       onItemsChange(newItems);
    } else {
      // If item does not exist, add it
      const newItem: ListItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        name: itemName.trim(),
        quantity: 1,
        checked: false,
      };
      onItemsChange([...list.items, newItem]);
    }
  };


  const handleDeleteItem = (itemId: string) => {
     const newItems = list.items.filter((item) => item.id !== itemId);
     onItemsChange(newItems);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleDeleteItem(itemId);
    } else {
      const newItems = list.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      onItemsChange(newItems);
    }
  };
  
  const ItemRow = ({ item }: { item: ListItem }) => (
    <li
      className={cn(
        "flex items-center gap-4 group transition-all duration-300",
         item.checked && "opacity-50"
      )}
    >
      <Checkbox
        id={`item-${item.id}`}
        checked={item.checked}
        onCheckedChange={(checked) =>
          handleItemCheckedChange(
            item.id,
            !!checked
          )
        }
        className="w-6 h-6 rounded-full"
      />
      <div className="flex-1">
        <label
          htmlFor={`item-${item.id}`}
          className={cn(
            "text-base font-medium transition-colors cursor-pointer", 
            item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
          )}
        >
          {item.name}
        </label>
      </div>

      <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Decrement item</span>
          </Button>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Increment item</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleDeleteItem(item.id)}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
              <span className="sr-only">Delete item</span>
          </Button>
      </div>
       <div className="flex items-center gap-2">
          <span className="text-base text-muted-foreground w-12 text-right font-medium">x{item.quantity}</span>
      </div>
    </li>
  )

  return (
    <div className="space-y-4 relative z-0">
       <AddItemSearch
          onAddItem={handleAddItem}
          popularItems={defaultCatalog}
          existingItems={list.items.map(i => i.name)}
        />

      <div className="bg-card rounded-lg border overflow-hidden">
        <Progress value={progress} className="h-2 rounded-none" />
         <div className="p-4 sm:p-6">
           {list.items.length === 0 ? (
             <div className="text-center py-12 px-4">
                <ShoppingCart className="mx-auto h-12 w-12 text-primary/40" strokeWidth={1.5} />
                <h3 className="mt-4 text-xl font-semibold text-foreground">Your list is ready for action!</h3>
                <p className="mt-1 text-muted-foreground">
                  Use the search bar above to add items to your grocery list.
                </p>
              </div>
           ) : (
            <ul className="space-y-3">
              {uncheckedItems.map(item => <ItemRow key={item.id} item={item} />)}

              {checkedItems.length > 0 && uncheckedItems.length > 0 && (
                 <li className="py-2">
                    <div className="h-[1px] w-full" style={{ background: 'linear-gradient(to right, transparent, hsl(var(--border)), transparent)' }} />
                  </li>
              )}
              
              {checkedItems.map(item => <ItemRow key={item.id} item={item} />)}
            </ul>
           )}
        </div>
         {list.items.length > 0 && (
          <div className="p-4 sm:p-6 pt-0">
             <FinishShoppingDialog
                onConfirm={(storeName) => console.log('Store name:', storeName)}
                disabled={checkedItems.length === 0}
              />
          </div>
        )}
      </div>
    </div>
  );
}
