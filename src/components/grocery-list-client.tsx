
'use client';

import type { Aisle, GroceryItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2, Plus, Minus } from 'lucide-react';
import { AddItemSearch } from './add-item-search';
import { cn } from '@/lib/utils';
import { popularItems } from '@/lib/mock-data';

type GroceryListClientProps = {
  initialAisles: Aisle[];
};

export function GroceryListClient({ initialAisles }: GroceryListClientProps) {
  const [aisles, setAisles] = useState<Aisle[]>(initialAisles);

  const sortedItems = useMemo(() => {
    const allItems = aisles.flatMap(aisle => 
      aisle.items.map(item => ({ ...item, aisleName: aisle.name }))
    );
    // Sort checked items to the bottom
    return allItems.sort((a, b) => {
      if (a.checked === b.checked) {
        return a.name.localeCompare(b.name); // Sort by name if checked status is the same
      }
      return a.checked ? 1 : -1;
    });
  }, [aisles]);

  const handleItemCheckedChange = (
    itemId: string,
    checked: boolean
  ) => {
    setAisles(
      aisles.map((aisle) => ({
        ...aisle,
        items: aisle.items.map((item) =>
          item.id === itemId ? { ...item, checked } : item
        ),
      }))
    );
  };
  
  const handleAddItem = (itemName: string) => {
    const itemNameLower = itemName.toLowerCase();
    let itemExists = false;

    // First, check if item exists and increment quantity
    const updatedAisles = aisles.map(aisle => {
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
      setAisles(updatedAisles);
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
      setAisles(newAisles);
    }
  };


  const handleDeleteItem = (itemId: string) => {
     setAisles(
      aisles.map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => item.id !== itemId),
      })).filter(aisle => aisle.items.length > 0)
    );
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleDeleteItem(itemId);
    } else {
      setAisles(
        aisles.map((aisle) => ({
          ...aisle,
          items: aisle.items.map((item) =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          ),
        }))
      );
    }
  };
  
  const allItems = useMemo(() => aisles.flatMap(a => a.items), [aisles]);

  return (
    <div className="space-y-4 relative z-0">
       <AddItemSearch
          onAddItem={handleAddItem}
          popularItems={popularItems}
          existingItems={allItems.map(i => i.name)}
        />

      <div className="bg-card rounded-lg border">
        <div className="p-4 sm:p-6">
          <ul className="space-y-3">
            {sortedItems.map((item) => (
              <li
                key={item.id}
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

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            ))}
             {allItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg font-medium text-muted-foreground">Your list is empty</p>
                <p className="text-sm text-muted-foreground">Add items using the search bar above.</p>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
