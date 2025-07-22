'use client';

import type { Aisle, GroceryItem } from '@/lib/types';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { cn } from '@/lib/utils';

type GroceryListClientProps = {
  initialAisles: Aisle[];
};

export function GroceryListClient({ initialAisles }: GroceryListClientProps) {
  const [aisles, setAisles] = useState<Aisle[]>(initialAisles);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const sortedItems = useMemo(() => {
    const allItems = aisles.flatMap(aisle => 
      aisle.items.map(item => ({ ...item, aisleId: aisle.id }))
    );
    return allItems.sort((a, b) => {
      if (a.checked && !b.checked) return 1;
      if (!a.checked && b.checked) return -1;
      return 0;
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
  
  const handleAddItem = (newItem: Omit<GroceryItem, 'id' | 'checked'>, aisleName: string) => {
    setAisles(prevAisles => {
      const newAisles = [...prevAisles];
      let aisle = newAisles.find(a => a.name.toLowerCase() === aisleName.toLowerCase());

      const itemToAdd: GroceryItem = {
        ...newItem,
        id: `item-${Date.now()}`,
        checked: false,
      };

      if (aisle) {
        aisle.items.push(itemToAdd);
      } else {
        newAisles.push({
          id: `aisle-${Date.now()}`,
          name: aisleName || 'Uncategorized',
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

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setAddDialogOpen(true)} variant="link" className="text-primary">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
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
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">x{item.quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete item</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <AddItemDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAddItem={handleAddItem}
        aisles={aisles.map(a => a.name)}
        />
    </>
  );
}
