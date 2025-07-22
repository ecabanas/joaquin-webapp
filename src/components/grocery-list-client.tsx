'use client';

import type { Aisle, GroceryItem } from '@/lib/types';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AddItemDialog } from './add-item-dialog';
import { Card, CardContent } from './ui/card';

type GroceryListClientProps = {
  initialAisles: Aisle[];
};

export function GroceryListClient({ initialAisles }: GroceryListClientProps) {
  const [aisles, setAisles] = useState<Aisle[]>(initialAisles);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const handleItemCheckedChange = (
    aisleId: string,
    itemId: string,
    checked: boolean
  ) => {
    setAisles(
      aisles.map((aisle) => {
        if (aisle.id === aisleId) {
          return {
            ...aisle,
            items: aisle.items.map((item) =>
              item.id === itemId ? { ...item, checked } : item
            ),
          };
        }
        return aisle;
      })
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

  const handleDeleteItem = (aisleId: string, itemId: string) => {
     setAisles(
      aisles.map((aisle) => {
        if (aisle.id === aisleId) {
          return {
            ...aisle,
            items: aisle.items.filter((item) => item.id !== itemId),
          };
        }
        return aisle;
      }).filter(aisle => aisle.items.length > 0)
    );
  };

  const allAisleIds = aisles.map((aisle) => aisle.id);

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Accordion
            type="multiple"
            defaultValue={allAisleIds}
            className="w-full"
          >
            {aisles.map((aisle) => (
              <AccordionItem value={aisle.id} key={aisle.id} className="border-b-0 last:border-b-0 [&:not(:last-child)]:border-b">
                <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline bg-card hover:bg-muted/50 transition-colors">
                  {aisle.name}
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 bg-background">
                  <ul className="space-y-4">
                    {aisle.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-4 group"
                      >
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.checked}
                          onCheckedChange={(checked) =>
                            handleItemCheckedChange(
                              aisle.id,
                              item.id,
                              !!checked
                            )
                          }
                          className="w-6 h-6"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`item-${item.id}`}
                            className={`font-medium transition-colors ${
                              item.checked ? 'text-muted-foreground line-through' : ''
                            }`}
                          >
                            {item.name}
                          </label>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(aisle.id, item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete item</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <AddItemDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAddItem={handleAddItem}
        aisles={aisles.map(a => a.name)}
        />
    </>
  );
}
