
'use client';

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
import { CheckCircle } from 'lucide-react';

type FinishShoppingDialogProps = {
  onConfirm: () => void;
  disabled?: boolean;
};

export function FinishShoppingDialog({ onConfirm, disabled }: FinishShoppingDialogProps) {
  return (
    <Dialog>
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
            This will archive all checked items to your purchase history. You can add prices and details later by analyzing a receipt from the history page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onConfirm}>
            Confirm and Archive
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
