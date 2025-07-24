
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
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
import { useToast } from '@/hooks/use-toast';
import { analyzeReceipt, type AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt';
import { updatePurchaseItems } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, ScanLine, Camera, Upload, ArrowLeft, Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

type ReceiptAnalyzerProps = {
  purchaseId: string;
};

export function ReceiptAnalyzer({ purchaseId }: ReceiptAnalyzerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeReceiptOutput | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captureInputRef = useRef<HTMLInputElement | null>(null);

  const resetAllState = () => {
      setPreview(null);
      setResult(null);
      setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
      if (!open) {
          resetAllState();
      }
      setIsOpen(open);
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyzeSubmit = async () => {
    if (!preview) {
      toast({
        title: 'No image selected',
        description: 'Please upload or take a picture of a receipt to analyze.',
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
    if (!result || !userProfile?.workspaceId) {
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
      handleOpenChange(false);
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

  const renderInitialView = () => (
    <>
      <DialogHeader>
        <DialogTitle>Analyze Receipt</DialogTitle>
        <DialogDescription>Use your camera or upload a photo of your receipt to automatically extract items and prices.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col sm:flex-row gap-4 justify-center my-6">
        <Button size="lg" onClick={() => captureInputRef.current?.click()}>
          <Camera className="mr-2" /> Take Photo
        </Button>
        <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2" /> Upload File
        </Button>
        {/* Hidden inputs to trigger camera or file picker */}
        <Input type="file" accept="image/*" capture onChange={handleFileChange} className="hidden" ref={captureInputRef} />
        <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
      </div>
    </>
  );

  const renderPreviewView = () => (
     <>
      <DialogHeader>
          <DialogTitle>Confirm Photo</DialogTitle>
          <DialogDescription>Use this photo to analyze the receipt, or go back to take a new one.</DialogDescription>
      </DialogHeader>
      <div className="my-4 relative aspect-video w-full rounded-md overflow-hidden border">
         {preview && <Image src={preview} alt="Receipt preview" fill={true} style={{objectFit:"contain"}} />}
      </div>
       <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
         <Button type="button" variant="ghost" onClick={() => setPreview(null)}>
            <ArrowLeft className="mr-2" /> Retake
          </Button>
         <Button type="button" onClick={handleAnalyzeSubmit}>
            Use Photo <Check className="ml-2" />
          </Button>
      </DialogFooter>
    </>
  );

  const renderLoadingView = () => (
     <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-8 h-64">
      <h3 className="text-xl font-medium text-foreground">Analyzing Receipt</h3>
      <div className="relative h-24 w-24">
         <Loader2 className="h-24 w-24 animate-spin text-primary/20" />
         <ScanLine className="absolute inset-0 h-24 w-24 text-primary animate-pulse" />
      </div>
      <p>This may take a moment...</p>
    </div>
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
         <Button type="button" variant="ghost" onClick={resetAllState}>
            Analyze Another
          </Button>
         <Button type="button" onClick={handleSaveToHistory} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Add to History'}
          </Button>
      </DialogFooter>
    </>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
          <Button>
            <ScanLine className="mr-2 h-4 w-4" /> Analyze Receipt
          </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {isLoading
          ? renderLoadingView()
          : result
          ? renderResultsView()
          : preview
          ? renderPreviewView()
          : renderInitialView()}
      </DialogContent>
    </Dialog>
  );
}
