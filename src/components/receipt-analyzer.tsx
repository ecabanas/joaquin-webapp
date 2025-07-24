
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeReceipt, type AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt';
import { updatePurchase, deletePurchase } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Check, Camera, CheckCircle, Trash2, PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useCurrency } from '@/hooks/use-currency';
import type { PurchaseItem } from '@/lib/types';
import { Input } from './ui/input';

type ReceiptAnalyzerProps = {
  receiptFile: File | null;
  purchaseId: string | null;
  onDone: () => void;
};

type Stage = 'loading' | 'results';

export function ReceiptAnalyzer({
  receiptFile,
  purchaseId,
  onDone,
}: ReceiptAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [stage, setStage] = useState<Stage>('loading');
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { formatCurrency } = useCurrency();

  const handleClose = useCallback(async (shouldDelete: boolean = false) => {
    if (isSaving) return;
    if (shouldDelete && purchaseId && userProfile?.workspaceId) {
       await deletePurchase(userProfile.workspaceId, purchaseId);
    }
    onDone();
  }, [isSaving, onDone, purchaseId, userProfile?.workspaceId]);

  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(receiptFile);
    } else {
      setPreview(null);
    }
  }, [receiptFile]);

  useEffect(() => {
    if (!preview) return;

    const doAnalysis = async () => {
        setStage('loading');
        try {
            const analysisResult = await analyzeReceipt({ receiptDataUri: preview });
            setStoreName(analysisResult.storeName);
            setItems(analysisResult.items);
            setStage('results');
        } catch (error) {
            console.error('Error analyzing receipt:', error);
            toast({
                title: 'Analysis Failed',
                description: 'Could not analyze the receipt. Please enter details manually.',
                variant: 'destructive',
            });
            setItems([]);
            setStoreName('');
            setStage('results');
        }
    };

    doAnalysis();

  }, [preview, toast]);

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    (item[field] as any) = value;
    setItems(newItems);
  };
  
  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };


  const handleSaveToHistory = async () => {
    if (!userProfile?.workspaceId || !purchaseId) {
      toast({ title: 'Error', description: 'Could not save purchase.', variant: 'destructive'});
      return;
    }
    setIsSaving(true);
    try {
      await updatePurchase(userProfile.workspaceId, purchaseId, {
        store: storeName,
        items,
      });
      toast({
        title: 'Success!',
        description: 'Purchase history has been updated.',
      });
      handleClose(false);
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save the updated item prices.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderLoading = () => (
    <>
       <DialogHeader className="p-4 sm:p-6 text-center">
        <DialogTitle>Analyzing Receipt</DialogTitle>
      </DialogHeader>
      <div className="flex-1 overflow-hidden p-4 pt-0 sm:p-6 sm:pt-0 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-lg overflow-hidden border bg-muted/40 flex items-center justify-center">
          {preview && (
            <Image
              src={preview}
              alt="Receipt preview"
              layout="fill"
              objectFit="cover"
              className="opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/30 animate-pulse" />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 text-white p-8 z-10">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              <Loader2 className="h-16 w-16 animate-spin text-white/80" style={{ animationDuration: '3s' }}/>
            </div>
            <p className="text-lg font-medium">Analyzing...</p>
          </div>
        </div>
      </div>
       <DialogFooter className="p-4 sm:p-6 border-t bg-background shrink-0">
        <Button type="button" variant="ghost" onClick={() => handleClose(true)} disabled>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  const renderResults = () => (
     <>
      <DialogHeader className="p-4 sm:p-6 text-center">
        <DialogTitle>Review Purchase</DialogTitle>
        <DialogDescription>Edit the details extracted from your receipt.</DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto border-y px-6 py-4 space-y-4">
        <div>
            <label htmlFor="store-name" className="text-sm font-medium">Store Name</label>
            <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. Super Grocer" />
        </div>
        <Table>
          <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center w-[60px]">Qty</TableHead>
              <TableHead className="text-right w-[100px]">Price</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium p-1">
                    <Input value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Item name" />
                </TableCell>
                <TableCell className="text-center p-1">
                    <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10) || 1)} className="text-center" />
                </TableCell>
                <TableCell className="text-right p-1">
                    <Input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} className="text-right" />
                </TableCell>
                <TableCell className="p-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="outline" size="sm" onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>
      <DialogFooter className="flex-row items-center justify-end gap-3 p-4 sm:p-6 bg-background shrink-0">
        <Button type="button" variant="ghost" onClick={() => handleClose(true)} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSaveToHistory} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 animate-spin"/> : <CheckCircle className="mr-2"/>}
          Save to History
        </Button>
      </DialogFooter>
    </>
  );

  const renderContent = () => {
    switch(stage) {
      case 'loading': return renderLoading();
      case 'results': return renderResults();
      default: return null;
    }
  }

  return (
    <Dialog open={!!receiptFile} onOpenChange={(isOpen) => !isOpen && handleClose(true)}>
      <DialogContent 
         hideCloseButton={isSaving} 
         className="p-0 gap-0 w-full h-full flex flex-col sm:w-auto sm:max-w-2xl sm:h-[90vh] sm:rounded-xl"
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
