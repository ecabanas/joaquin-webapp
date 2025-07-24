
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, ScanLine, Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

type ReceiptAnalyzerProps = {
  receiptFile: File | null;
  purchaseId: string | null;
  onDone: () => void;
};

export function ReceiptAnalyzer({
  receiptFile,
  purchaseId,
  onDone,
}: ReceiptAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeReceiptOutput | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const handleClose = () => {
    setPreview(null);
    setResult(null);
    setIsLoading(false);
    onDone(); // Notify parent component that we are done
  };
  
  // When a new file is passed, create a preview URL
  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // Clear previous results
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveToHistory = async () => {
    if (!result || !userProfile?.workspaceId || !purchaseId) {
      toast({ title: 'Error', description: 'No result to save.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    try {
      await updatePurchaseItems(userProfile.workspaceId, purchaseId, result.items);
      toast({
        title: 'Success!',
        description: 'Purchase history has been updated with the receipt data.',
      });
      handleClose(); // Close the dialog on success
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save the updated item prices.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreviewView = () => (
     <>
      <DialogHeader>
          <DialogTitle>Confirm Photo</DialogTitle>
          <DialogDescription>Use this photo to analyze the receipt, or take another one.</DialogDescription>
      </DialogHeader>
      <div className="my-4 relative aspect-video w-full rounded-md overflow-hidden border">
         {preview && <Image src={preview} alt="Receipt preview" fill={true} style={{objectFit:"contain"}} />}
      </div>
       <DialogFooter>
         <Button type="button" onClick={handleAnalyzeSubmit}>
            Use Photo <Check className="ml-2" />
          </Button>
      </DialogFooter>
    </>
  );

  const renderLoadingView = () => (
    <>
      <DialogHeader>
        <DialogTitle>Analyzing Receipt</DialogTitle>
        <DialogDescription>This may take a moment...</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-8 h-64">
        <div className="relative h-24 w-24">
          <Loader2 className="h-24 w-24 animate-spin text-primary/20" />
          <ScanLine className="absolute inset-0 h-24 w-24 text-primary animate-pulse" />
        </div>
      </div>
    </>
  );

  const renderResultsView = () => (
    <>
       <DialogHeader>
          <DialogTitle>Analysis Complete</DialogTitle>
          <DialogDescription>Review the items below. When you're ready, add them to your history.</DialogDescription>
        </DialogHeader>
      <div className="my-4 max-h-80 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center w-[60px]">Qty</TableHead>
              <TableHead className="text-right w-[100px]">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result?.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
         <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
         <Button type="button" onClick={handleSaveToHistory} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Add to History'}
          </Button>
      </DialogFooter>
    </>
  );
  
  return (
    <Dialog open={!!preview} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        {isLoading ? renderLoadingView() : result ? renderResultsView() : renderPreviewView()}
      </DialogContent>
    </Dialog>
  );
}
