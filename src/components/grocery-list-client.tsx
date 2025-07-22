'use client';

import type { Aisle, GroceryItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2 } from 'lucide-react';
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
    return allItems.sort((a, b) => {
      if (a.checked && !b.checked) return 1;
      if (!a.checked && b.checked) return -1;
      // Simple sort by name for unchecked items
      if (!a.checked && !b.checked) return a.name.localeCompare(b.name);
      return 0; // Keep order for checked items
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
    setAisles(prevAisles => {
      const allItems = prevAisles.flatMap(a => a.items);
      const existingItem = allItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      
      if (existingItem) {
        // Item already exists, maybe increment quantity in the future? For now, do nothing.
         return prevAisles;
      }
        
      const newAisles = [...prevAisles];
      const aisleName = 'Uncategorized';
      let aisle = newAisles.find(a => a.name.toLowerCase() === aisleName.toLowerCase());

      const itemToAdd: GroceryItem = {
        name: itemName,
        id: `item-${Date.now()}`,
        checked: false,
        quantity: 1,
      };

      if (aisle) {
        aisle.items.push(itemToAdd);
      } else {
        newAisles.push({
          id: `aisle-${Date.now()}`,
          name: aisleName,
          items: [itemToAdd],
        });
      }
      return newAisles;
    });
  };

  const handleDeleteItem = (itemId: string) => {
     setAisles(
      aisles.map((aisle) => ({
        ...aisle,
        items: aisle.items.filter((item) => item.id !== itemId),
      })).filter(aisle => aisle.items.length > 0)
    );
  };
  
  const allItems = useMemo(() => aisles.flatMap(a => a.items), [aisles]);

  return (
    <>
      <div className="mb-4">
        <AddItemSearch
          onAddItem={handleAddItem}
          popularItems={popularItems}
          existingItems={allItems.map(i => i.name)}
        />
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-4">
          <ul className="space-y-3">
            {sortedItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 group justify-center transition-all duration-300 ease-in-out",
                   item.checked && "opacity-60"
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
                  className="w-5 h-5 rounded-full"
                />
                <div className="flex-1 max-w-sm">
                  <label
                    htmlFor={`item-${item.id}`}
                    className={cn(
                      "text-base transition-colors", 
                      item.checked ? 'text-muted-foreground line-through' : 'font-medium'
                    )}
                  >
                    {item.name}
                  </label>
                   <p className="text-sm text-muted-foreground">
                      {item.aisleName}
                    </p>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">x{item.quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete item</span>
                </Button>
              </li>
            ))}
             {allItems.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Your list is empty. Add items using the search bar above.</p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
