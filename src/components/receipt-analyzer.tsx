
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
import { updatePurchaseItems } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Check, Camera, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { useCurrency } from '@/hooks/use-currency';

type ReceiptAnalyzerProps = {
  receiptFile: File | null;
  purchaseId: string | null;
  onDone: () => void;
  onRetake: () => void;
};

type Stage = 'preview' | 'loading' | 'results';

export function ReceiptAnalyzer({
  receiptFile,
  purchaseId,
  onDone,
  onRetake,
}: ReceiptAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeReceiptOutput | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { formatCurrency } = useCurrency();

  const stage: Stage = useMemo(() => {
    if (isProcessing) return 'loading';
    if (result) return 'results';
    return 'preview';
  }, [isProcessing, result]);

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    onDone();
  }, [isProcessing, onDone]);

  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // Reset result when a new file is chosen
      };
      reader.readAsDataURL(receiptFile);
    } else {
      setPreview(null);
    }
  }, [receiptFile]);

  const handleAnalyzeSubmit = async () => {
    if (!preview) {
      toast({
        title: 'No image selected',
        description: 'Please upload a photo of a receipt to analyze.',
        variant: 'destructive',
      });
      return;
    }
    setIsProcessing(true);
    setResult(null);
    try {
      const analysisResult = await analyzeReceipt({ receiptDataUri: preview });
      setResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the receipt. Please try again.',
        variant: 'destructive',
      });
      setResult(null); // Ensure result is null on failure
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!result || !userProfile?.workspaceId || !purchaseId) {
      toast({ title: 'Error', description: 'No result to save.', variant: 'destructive'});
      return;
    }
    setIsProcessing(true);
    try {
      await updatePurchaseItems(userProfile.workspaceId, purchaseId, result.items);
      toast({
        title: 'Success!',
        description: 'Purchase history has been updated.',
      });
      handleClose();
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save the updated item prices.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPreview = () => (
    <>
      <DialogHeader className="text-center p-4 sm:p-6 shrink-0">
        <DialogTitle>Confirm Photo</DialogTitle>
        <DialogDescription>Is this photo clear enough to analyze?</DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-hidden p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="relative w-full h-full rounded-lg overflow-hidden border">
           {preview && <Image src={preview} alt="Receipt preview" layout="fill" objectFit="contain" />}
        </div>
      </div>
      <DialogFooter className="flex-row items-center justify-end gap-3 p-4 border-t bg-background shrink-0 sm:p-6">
        <Button type="button" variant="outline" onClick={onRetake} disabled={isProcessing}>
            <Camera className="mr-2" />
            Retake
        </Button>
        <Button type="button" onClick={handleAnalyzeSubmit} disabled={isProcessing}>
            Use Photo <Check className="ml-2" />
        </Button>
      </DialogFooter>
    </>
  );

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
        <Button type="button" variant="ghost" onClick={handleClose} disabled>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );

  const renderResults = () => (
     <>
      <DialogHeader className="p-4 sm:p-6 text-center">
        <DialogTitle>Analysis Complete</DialogTitle>
        <DialogDescription>Review the items found on your receipt.</DialogDescription>
      </DialogHeader>
      <div className="flex-1 overflow-y-auto border-y">
        <Table>
          <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center w-[60px]">Qty</TableHead>
              <TableHead className="text-right w-[100px]">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result && result.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DialogFooter className="flex-row items-center justify-end gap-3 p-4 sm:p-6 bg-background shrink-0">
        <Button type="button" variant="ghost" onClick={handleClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSaveToHistory} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 animate-spin"/> : <CheckCircle className="mr-2"/>}
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
    <Dialog open={!!receiptFile} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent 
         hideCloseButton={isProcessing} 
         className="p-0 gap-0 w-full h-full flex flex-col sm:w-auto sm:max-w-md sm:h-[90vh] sm:rounded-xl"
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
