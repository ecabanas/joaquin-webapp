
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Loader2, CheckCircle, Trash2, PlusCircle, RefreshCw, ShoppingCart, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import type { PurchaseItem, Purchase } from '@/lib/types';
import { Input } from './ui/input';

type ReceiptAnalyzerProps = {
  receiptFile: File | null;
  purchase: Purchase;
  workspaceId: string;
  onSave: (purchaseId: string, storeName: string, items: PurchaseItem[], comparison?: Purchase['comparison']) => void;
  onClose: () => void;
  onRetake: () => void;
};

type Stage = 'preview' | 'loading' | 'results';

export function ReceiptAnalyzer({
  receiptFile,
  purchase,
  workspaceId,
  onSave,
  onClose,
  onRetake,
}: ReceiptAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [comparison, setComparison] = useState<Purchase['comparison'] | undefined>(undefined);
  const [stage, setStage] = useState<Stage>('preview');
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  
  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setStage('preview');
      };
      reader.readAsDataURL(receiptFile);
    } else {
      setPreview(null);
    }
  }, [receiptFile]);

  const handleAnalyze = useCallback(async () => {
    if (!preview) return;

    setStage('loading');
    try {
        const analysisResult = await analyzeReceipt({ 
          receiptDataUri: preview,
          originalItems: purchase.originalItems || [],
        });
        setStoreName(analysisResult.storeName);
        setItems(analysisResult.items);
        setComparison(analysisResult.comparison);
        setStage('results');
    } catch (error) {
        console.error('Error analyzing receipt:', error);
        toast({
            title: 'Analysis Failed',
            description: 'Could not analyze the receipt. Please enter details manually.',
            variant: 'destructive',
        });
        setItems(purchase.items); // Fallback to original items
        setStoreName(purchase.store);
        setStage('results');
    }
  }, [preview, toast, purchase]);

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
    setIsSaving(true);
    try {
      onSave(purchase.id, storeName, items, comparison);
      toast({
        title: 'Success!',
        description: 'Purchase history has been updated.',
      });
    } catch (error) {
       console.error('Error saving purchase:', error);
       toast({
        title: 'Save Failed',
        description: 'Could not save the updated item prices.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => (
    <>
      <DialogHeader className="p-4 sm:p-6 border-b text-center">
        <DialogTitle>Confirm Your Photo</DialogTitle>
        <DialogDescription>Is the receipt image clear enough to read?</DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-hidden relative p-4">
        {preview && (
          <Image
            src={preview}
            alt="Receipt preview"
            layout="fill"
            objectFit="contain"
          />
        )}
      </div>
      <DialogFooter className="flex-row items-center justify-end gap-2 p-4 sm:p-6 border-t bg-background shrink-0">
        <Button type="button" variant="outline" onClick={onRetake} disabled={isSaving}>
          <RefreshCw className="mr-2" /> Retake
        </Button>
        <Button type="button" onClick={handleAnalyze} disabled={isSaving}>
          <CheckCircle className="mr-2"/> Use Photo
        </Button>
      </DialogFooter>
    </>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center text-center h-full w-full">
      <DialogHeader>
        <DialogTitle>Analyzing Receipt</DialogTitle>
        <DialogDescription>Extracting items, prices, and insights...</DialogDescription>
      </DialogHeader>
      <div className="relative w-full max-w-[200px] aspect-[9/16] rounded-lg overflow-hidden border bg-muted/40 flex items-center justify-center my-auto">
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
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
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
      case 'preview': return renderPreview();
      case 'loading': return renderLoading();
      case 'results': return renderResults();
      default: return null;
    }
  }

  return (
    <Dialog open={!!receiptFile} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
         hideCloseButton={isSaving} 
         className="p-0 gap-0 w-full h-full flex flex-col sm:max-w-2xl sm:h-[90vh] sm:rounded-xl"
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
