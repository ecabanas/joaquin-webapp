'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import type { GroceryItem } from '@/lib/types';

type AddItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddItem: (newItem: Omit<GroceryItem, 'id' | 'checked'>, aisleName: string) => void;
  aisles: string[];
};

export function AddItemDialog({ isOpen, onOpenChange, onAddItem, aisles }: AddItemDialogProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [aisle, setAisle] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !aisle.trim()) return;
    
    onAddItem({ name, quantity, notes }, aisle);
    
    // Reset form and close dialog
    setName('');
    setQuantity(1);
    setNotes('');
    setAisle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Enter the details for the new grocery item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="add-item-form">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item-name" className="text-right">
                Item Name
              </Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aisle" className="text-right">
                Aisle
              </Label>
              <Input
                id="aisle"
                value={aisle}
                onChange={(e) => setAisle(e.target.value)}
                className="col-span-3"
                list="aisle-suggestions"
                required
              />
              <datalist id="aisle-suggestions">
                {aisles.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="col-span-3"
                min="1"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="(optional)"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="add-item-form">Add to List</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
