
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

type FinishShoppingDialogProps = {
  onConfirm: (storeName: string) => void;
  disabled?: boolean;
};

export function FinishShoppingDialog({ onConfirm, disabled }: FinishShoppingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [storeName, setStoreName] = useState('Mercadona');

  const handleConfirm = () => {
    if (storeName.trim()) {
      onConfirm(storeName.trim());
      setIsOpen(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    // When dialog closes, reset its state for next time
    if (!open) {
      setStoreName('Mercadona');
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={disabled} className="w-full">
          <CheckCircle className="mr-2" />
          Finish Shopping
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Shopping Trip</DialogTitle>
          <DialogDescription>
            Enter the name of the store to archive this list to your purchase history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="store-name" className="text-left">Store Name</Label>
          <Input
            id="store-name"
            placeholder="e.g. Super Grocer"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm} disabled={!storeName.trim()}>
            Confirm and Archive List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
