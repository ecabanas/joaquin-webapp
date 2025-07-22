'use client';

import { useState } from 'react';
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
import { Loader2, ScanLine, Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function ReceiptAnalyzer() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeReceiptOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const resetState = () => {
    setFile(null);
    setPreview(null);
    setIsLoading(false);
    setResult(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  const handleSubmit = async () => {
    if (!file || !preview) {
      toast({
        title: 'No file selected',
        description: 'Please select a receipt image to analyze.',
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <ScanLine className="mr-2 h-4 w-4" /> Analyze Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Analyze a New Receipt</DialogTitle>
          <DialogDescription>
            Upload a photo of your receipt to automatically add items to your
            purchase history.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!result && (
             <div className="space-y-2">
              <label htmlFor="receipt-upload" className="block text-sm font-medium text-foreground">
                Upload Receipt
              </label>
              <div className="flex items-center gap-2">
                <Input id="receipt-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
              </div>
            </div>
          )}
         

          {preview && !result && (
            <div className="relative mt-4 h-64 w-full rounded-md border border-dashed flex items-center justify-center overflow-hidden">
               <Image
                src={preview}
                alt="Receipt preview"
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Analyzing receipt... this may take a moment.</p>
            </div>
          )}

          {result && (
            <div>
              <h3 className="font-semibold mb-2">Analysis Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">We found the following items. You can add them to your history.</p>
              <div className="max-h-64 overflow-y-auto rounded-md border">
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
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
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-2 mt-4">
          {result ? (
             <Button type="button" onClick={() => handleOpenChange(false)}>
              Add to History
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={!file || isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
