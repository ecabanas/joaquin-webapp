
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Loader2, ScanLine, Check, Camera, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { cn } from '@/lib/utils';


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

  const stage: Stage = useMemo(() => {
    if (isProcessing) return 'loading';
    if (result) return 'results';
    return 'preview';
  }, [isProcessing, result]);
  
  const handleClose = useCallback(() => {
    // Guard against closing while loading
    if (isProcessing) return;
    onDone();
  }, [isProcessing, onDone]);
  
  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null);
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
      // On failure, go back to the preview stage
      setResult(null);
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

  const renderContent = () => (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-4 sm:p-6 text-center shrink-0">
        <DialogTitle>{
          stage === 'preview' ? 'Confirm Photo' :
          stage === 'loading' ? 'Analyzing...' : 'Analysis Complete'
        }</DialogTitle>
        <DialogDescription>{
          stage === 'preview' ? 'Is this photo clear enough to analyze?' :
          stage === 'loading' ? 'Extracting items from your receipt.' : 'Review the items found on your receipt.'
        }</DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-hidden px-4 sm:px-6">
        {/* Preview & Loading Content */}
        <div className={cn(
          "relative aspect-[9/16] w-full max-w-sm mx-auto h-full rounded-lg overflow-hidden border bg-muted transition-all duration-300",
          stage === 'results' && 'hidden'
        )}>
          {preview && <Image src={preview} alt="Receipt preview" layout="fill" objectFit="contain" />}
          
          {stage === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm text-white p-8">
               <div className="relative h-16 w-16">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                  <Loader2 className="h-16 w-16 animate-spin text-white/80" style={{ animationDuration: '3s' }}/>
               </div>
               <p className="text-lg font-medium">Analyzing...</p>
            </div>
          )}
        </div>

        {/* Results Content */}
        {stage === 'results' && result && (
            <div className="h-full overflow-y-auto border rounded-lg">
                <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                    <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center w-[60px]">Qty</TableHead>
                    <TableHead className="text-right w-[100px]">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.items.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        )}
      </div>

      <DialogFooter className="flex-row items-center justify-end gap-3 p-4 border-t bg-background shrink-0 sm:p-6">
        {stage === 'preview' && (
            <>
                <Button type="button" variant="outline" onClick={onRetake}>
                    <Camera className="mr-2" />
                    Retake
                </Button>
                <Button type="button" onClick={handleAnalyzeSubmit}>
                    Use Photo <Check className="ml-2" />
                </Button>
            </>
        )}
        {stage === 'results' && (
             <>
                <Button type="button" variant="ghost" onClick={handleClose}>
                    Cancel
                </Button>
                <Button type="button" onClick={handleSaveToHistory} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="mr-2 animate-spin"/> : <CheckCircle className="mr-2"/>}
                    Save to History
                </Button>
            </>
        )}
      </DialogFooter>
    </div>
  );
  
  return (
    <Dialog open={!!receiptFile} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent 
         hideCloseButton={true} 
         className="p-0 gap-0 w-full h-full sm:w-[calc(100%-2rem)] sm:h-auto sm:max-w-md sm:max-h-[90vh] sm:rounded-xl"
      >
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
