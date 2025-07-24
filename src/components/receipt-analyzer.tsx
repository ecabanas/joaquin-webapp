
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Loader2, ScanLine, Camera, Upload, ArrowLeft, Check, X } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-is-mobile';

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
  const isMobile = useIsMobile();
  
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'active' | 'denied'>('idle');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraStatus('idle');
    }
  }, []);

  const requestCamera = useCallback(async () => {
    if (!videoRef.current) return;
    
    setCameraStatus('idle');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // The play() call is essential for mobile browsers, especially Safari.
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
        setCameraStatus('active');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraStatus('denied');
    }
  }, []);

  useEffect(() => {
    if (isOpen && isMobile && !preview) {
      requestCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    }
  }, [isOpen, isMobile, preview, requestCamera, stopCamera]);
  
  // A callback ref ensures that the `requestCamera` function
  // is only called when the video element is actually mounted in the DOM.
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && isOpen && isMobile && !preview) {
      requestCamera();
    }
  }, [isOpen, isMobile, preview, requestCamera]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(selectedFile);
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
      stopCamera();
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
      setIsOpen(false);
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
  
  const VisuallyHiddenTitle = ({ children }: { children: React.ReactNode }) => (
    <DialogTitle className="sr-only">{children}</DialogTitle>
  );

  const CameraView = () => (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      <VisuallyHiddenTitle>Take Receipt Photo</VisuallyHiddenTitle>
      
      {/* Video Feed Layer (Bottom) */}
      <video 
        ref={videoCallbackRef} 
        className="absolute inset-0 h-full w-full object-cover z-0" 
        autoPlay 
        muted 
        playsInline // Crucial for iOS
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* UI Controls Layer (Top) */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between">
         {/* Top Controls */}
        <div className="flex justify-start p-4">
           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center">
            <button
              onClick={handleTakePicture}
              disabled={cameraStatus !== 'active'}
              className="h-20 w-20 rounded-full border-4 border-white bg-transparent ring-4 ring-black/30 disabled:opacity-50 transition-opacity"
              aria-label="Take Picture"
            />
          </div>
           <div className="absolute bottom-6 right-6">
             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-6 w-6 text-white" />
              </Button>
              <Input id="receipt-upload-camera" type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
          </div>
        </div>
      </div>

       {/* Status Overlay Layer (Topmost) */}
      {cameraStatus !== 'active' && (
         <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center p-8 text-center gap-4 text-white">
            {cameraStatus === 'denied' && (
              <>
                <Camera className="h-16 w-16 text-primary/50" />
                <Alert variant="destructive" className="sm:w-auto text-left">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access in your browser settings to use this feature.
                    </AlertDescription>
                </Alert>
                <Button onClick={requestCamera} variant="secondary">Try Again</Button>
              </>
            )}
            {cameraStatus === 'idle' && (
              <>
                <Loader2 className="w-12 h-12 animate-spin" />
                <p>Starting camera...</p>
              </>
            )}
        </div>
      )}
    </div>
  );

  const PreviewView = () => (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      <VisuallyHiddenTitle>Confirm Receipt Photo</VisuallyHiddenTitle>
      {preview && <Image src={preview} alt="Receipt preview" fill={true} style={{objectFit:"contain"}} />}
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent z-10">
        <div className="flex items-center justify-around">
          <Button
            onClick={() => { setPreview(null); }}
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
    <div className={cn(isMobile ? "p-4 pt-16" : "p-6")}>
       <DialogHeader>
          <VisuallyHiddenTitle>Analysis Complete</VisuallyHiddenTitle>
          <DialogTitle>Analysis Complete</DialogTitle>
          <DialogDescription>Review the items below. When you're ready, add them to your history.</DialogDescription>
        </DialogHeader>
      <div className="my-4 max-h-64 sm:max-h-80 overflow-y-auto rounded-md border">
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
         <Button type="button" variant="ghost" onClick={() => { setPreview(null); setResult(null); }} className="w-full sm:w-auto">
            Analyze Another
          </Button>
         <Button type="button" onClick={handleSaveToHistory} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : 'Add to History'}
          </Button>
      </DialogFooter>
       {isMobile && (
          <div className="absolute top-4 left-4 z-10">
             <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={() => { setPreview(null); setResult(null); }}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </div>
       )}
    </div>
  );

  const LoadingView = () => (
     <div className="absolute sm:relative inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground p-8 bg-background">
      <VisuallyHiddenTitle>Analyzing Receipt</VisuallyHiddenTitle>
      <h3 className="text-xl font-medium text-foreground">Analyzing Receipt</h3>
      <div className="relative h-24 w-24">
         <Loader2 className="h-24 w-24 animate-spin text-primary/20" />
         <ScanLine className="absolute inset-0 h-24 w-24 text-primary animate-pulse" />
      </div>
      <p>This may take a moment...</p>
    </div>
  );

  const DesktopUploadView = () => (
    <div>
      <DialogHeader>
        <DialogTitle>Analyze Receipt</DialogTitle>
        <DialogDescription>Upload a photo of your receipt to automatically extract items and prices.</DialogDescription>
      </DialogHeader>
      <div className="my-6">
        <label htmlFor="receipt-upload-desktop" className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
        <Input id="receipt-upload-desktop" type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <DialogFooter>
        <Button onClick={handleAnalyzeSubmit} disabled={!preview || isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </DialogFooter>
    </div>
  );
  
  const resetAllState = () => {
      setPreview(null);
      setResult(null);
      setIsLoading(false);
  }

  const handleOpenChange = (open: boolean) => {
      if (!open) {
          resetAllState();
      }
      setIsOpen(open);
  }

  const getStage = () => {
    if (isLoading) return 'loading';
    if (result) return 'result';
    if (preview) return 'preview';
    if (isMobile) return 'camera';
    return 'desktop_upload';
  }

  const stage = getStage();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        { isMobile && 
          <Button>
            <ScanLine className="mr-2 h-4 w-4" /> Analyze Receipt
          </Button>
        }
      </DialogTrigger>
      <DialogContent 
        className={cn(
          "p-0 gap-0 border-0",
          isMobile && 'w-screen h-screen max-w-full rounded-none',
          !isMobile && 'sm:max-w-md sm:rounded-lg',
          stage === 'camera' || stage === 'preview' ? 'sm:h-[80vh] sm:w-[45vh] sm:max-w-[45vh]' : '',
          stage === 'loading' && !isMobile && 'sm:max-w-sm',
          stage === 'result' && !isMobile && 'sm:max-w-md',
          stage === 'desktop_upload' && 'p-6'
        )}
        hideCloseButton={isMobile || stage === 'loading'}
        onEscapeKeyDown={() => {
            if (stage === 'preview' || stage === 'result') {
                resetAllState();
            } else {
                setIsOpen(false);
            }
        }}
      >
        {stage === 'camera' && <CameraView />}
        {stage === 'preview' && <PreviewView />}
        {stage === 'loading' && <LoadingView />}
        {stage === 'result' && <ResultsView />}
        {stage === 'desktop_upload' && <DesktopUploadView />}
      </DialogContent>
    </Dialog>
  );
}

    