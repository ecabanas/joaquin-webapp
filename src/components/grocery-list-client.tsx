
'use client';

import type { Aisle, GroceryItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { AddItemSearch } from './add-item-search';
import { cn } from '@/lib/utils';
import { popularItems } from '@/lib/mock-data';
import { Progress } from './ui/progress';

type GroceryListClientProps = {
  aisles: Aisle[];
  onAislesChange: (aisles: Aisle[]) => void;
  progress: number;
};

export function GroceryListClient({ aisles, onAislesChange, progress }: GroceryListClientProps) {

  const { checkedItems, uncheckedItems, allItems } = useMemo(() => {
    const allItems = aisles.flatMap(aisle => 
      aisle.items.map(item => ({ ...item, aisleName: aisle.name }))
    );
    const sorted = allItems.sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      allItems,
      checkedItems: sorted.filter(item => item.checked),
      uncheckedItems: sorted.filter(item => !item.checked),
    }
  }, [aisles]);

  const updateAisles = (newAisles: Aisle[]) => {
    // Filter out aisles that have no items
    const filteredAisles = newAisles.map(aisle => ({
      ...aisle,
      items: aisle.items,
    })).filter(aisle => aisle.items.length > 0);
    onAislesChange(filteredAisles);
  };


  const handleItemCheckedChange = (
    itemId: string,
    checked: boolean
  ) => {
    const newAisles = aisles.map((aisle) => ({
      ...aisle,
      items: aisle.items.map((item) =>
        item.id === itemId ? { ...item, checked } : item
      ),
    }));
    updateAisles(newAisles);
  };
  
  const handleAddItem = (itemName: string) => {
    const itemNameLower = itemName.toLowerCase();
    let itemExists = false;

    // First, check if item exists and increment quantity
    let updatedAisles = aisles.map(aisle => {
      const updatedItems = aisle.items.map(item => {
        if (item.name.toLowerCase() === itemNameLower) {
          itemExists = true;
          // If item is already on list, uncheck it and increment quantity
          return { ...item, quantity: item.quantity + 1, checked: false };
        }
        return item;
      });
      return { ...aisle, items: updatedItems };
    });

    if (itemExists) {
      updateAisles(updatedAisles);
    } else {
      // If item does not exist, add it to 'Uncategorized'
      const newAisles = [...aisles];
      const aisleName = 'Uncategorized'; // Or determine aisle based on item
      let aisle = newAisles.find(a => a.name.toLowerCase() === aisleName.toLowerCase());

      const newItem: GroceryItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        name: itemName.trim(),
        quantity: 1,
        checked: false,
      };

      if (aisle) {
        aisle.items.push(newItem);
      } else {
        // Create the aisle if it doesn't exist
        newAisles.push({
          id: `aisle-${Date.now()}`,
          name: aisleName,
          items: [newItem],
        });
      }
      updateAisles(newAisles);
    }
  };


  const handleDeleteItem = (itemId: string) => {
     const newAisles = aisles.map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => item.id !== itemId),
      }));
      updateAisles(newAisles);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleDeleteItem(itemId);
    } else {
      const newAisles = aisles.map((aisle) => ({
        ...aisle,
        items: aisle.items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
      updateAisles(newAisles);
    }
  };
  
  const ItemRow = ({ item }: { item: GroceryItem & { aisleName: string } }) => (
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
          popularItems={popularItems}
          existingItems={allItems.map(i => i.name)}
        />

      <div className="bg-card rounded-lg border border-t-0 overflow-hidden">
        {allItems.length > 0 && <Progress value={progress} className="h-2 rounded-none" />}
         <div className="p-4 sm:p-6">
           {allItems.length === 0 ? (
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
      </div>
    </div>
  );
}
