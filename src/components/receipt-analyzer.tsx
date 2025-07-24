
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeReceipt, type AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt';
import { updatePurchaseItems } from '@/lib/firestore';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, ScanLine, Camera, Upload, RefreshCcw, ArrowLeft, Check, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
  purchaseId: string;
};

export function ReceiptAnalyzer({ purchaseId }: ReceiptAnalyzerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeReceiptOutput | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetState = (keepDialogOpen = false) => {
    setFile(null);
    setPreview(null);
    setIsLoading(false);
    setResult(null);
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (!keepDialogOpen) {
      setIsOpen(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    } else {
      // Immediately request camera when opened
      requestCamera();
    }
  };

  const requestCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    } else {
      setHasCameraPermission(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      // Stop camera stream if it's running
      if (videoRef.current?.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      const dataUri = canvas.toDataURL('image/jpeg');
      setPreview(dataUri);
      
      if (video.srcObject) {
         const stream = video.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    }
  }

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
      handleOpenChange(false); // Close dialog on success
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

  const CameraView = () => (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      <DialogTitle className="sr-only">Take Receipt Photo</DialogTitle>
      <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {hasCameraPermission === false && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center gap-4">
          <Camera className="h-16 w-16 text-primary/50" />
          <Alert variant="destructive" className="sm:w-auto">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access in your browser settings to use this feature.
              </AlertDescription>
          </Alert>
          <Button onClick={requestCamera} variant="secondary">Try Again</Button>
        </div>
      )}

      {/* Camera Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50">
              <X className="h-6 w-6 text-white" />
            </Button>
          </DialogClose>
          <button
            onClick={handleTakePicture}
            disabled={!hasCameraPermission}
            className="h-20 w-20 rounded-full border-4 border-white bg-transparent ring-4 ring-black/30 disabled:opacity-50"
            aria-label="Take Picture"
          />
          <label htmlFor="receipt-upload-camera" className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white cursor-pointer hover:bg-black/50">
            <Upload className="h-6 w-6" />
            <Input id="receipt-upload-camera" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );

  const PreviewView = () => (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      <DialogTitle className="sr-only">Confirm Receipt Photo</DialogTitle>
      {preview && <Image src={preview} alt="Receipt preview" layout="fill" objectFit="contain" />}
      
      {/* Preview Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-around">
          <Button
            onClick={() => { setPreview(null); requestCamera(); }}
            variant="ghost"
            className="h-16 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white font-bold text-lg px-8"
          >
            <ArrowLeft className="mr-2" /> Retake
          </Button>
          <Button
            onClick={handleAnalyzeSubmit}
            className="h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8"
          >
            Use Photo <Check className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const ResultsView = () => (
    <div className="p-0 sm:p-6">
       <DialogHeader>
          <DialogTitle>Analysis Complete</DialogTitle>
          <DialogDescription>Review the items below. When you're ready, add them to your history.</DialogDescription>
        </DialogHeader>
      <div className="my-4 max-h-64 sm:max-h-80 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
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
       <DialogFooter className="sm:justify-between gap-2">
         <Button type="button" onClick={handleSaveToHistory} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : 'Add to History'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => { setPreview(null); setResult(null); requestCamera(); }} className="w-full sm:w-auto">
            Analyze Another
          </Button>
      </DialogFooter>
    </div>
  );

  const LoadingView = () => (
     <div className="absolute sm:relative inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground p-8 bg-background">
      <DialogTitle className="sr-only">Analyzing Receipt</DialogTitle>
      <h3 className="text-xl font-medium text-foreground">Analyzing Receipt</h3>
      <div className="relative h-24 w-24">
         <Loader2 className="h-24 w-24 animate-spin text-primary/20" />
         <ScanLine className="absolute inset-0 h-24 w-24 text-primary animate-pulse" />
      </div>
      <p>This may take a moment...</p>
    </div>
  );
  
  const getStage = () => {
    if (isLoading) return 'loading';
    if (result) return 'result';
    if (preview) return 'preview';
    return 'camera';
  }

  const stage = getStage();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <ScanLine className="mr-2 h-4 w-4" /> Analyze Receipt
        </Button>
      </DialogTrigger>
      <DialogContent 
        className={cn(
          "p-0 gap-0 border-0",
          "sm:max-w-md sm:rounded-lg",
          stage === 'camera' || stage === 'preview' ? 'w-screen h-screen max-w-full sm:h-[80vh] sm:w-[45vh] sm:max-w-[45vh] rounded-none' : '',
          stage === 'loading' && 'sm:max-w-sm',
          stage === 'result' && 'sm:max-w-md'
        )}
        hideCloseButton={stage === 'camera' || stage === 'preview'}
      >
        {stage === 'camera' && <CameraView />}
        {stage === 'preview' && <PreviewView />}
        {stage ==='loading' && <LoadingView />}
        {stage ==='result' && <ResultsView />}

      </DialogContent>
    </Dialog>
  );
}
