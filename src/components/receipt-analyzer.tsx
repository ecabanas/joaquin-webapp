
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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeReceipt, type AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt';
import { Loader2, ScanLine, Camera, Upload, RefreshCcw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
  
  // Camera-related state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


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
  
  const resetState = (keepDialogOpen = false) => {
    setFile(null);
    setPreview(null);
    setIsLoading(false);
    setResult(null);
    setIsCameraOpen(false);
    
    // Stop camera stream
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
    }
  };

  const handleUseCamera = async () => {
    if (isCameraOpen) {
       setIsCameraOpen(false);
       return;
    }
    
    setIsCameraOpen(true);
    setPreview(null);
    setFile(null);
    
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
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    } else {
       setHasCameraPermission(false);
       toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
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
      
      // Stop the camera and switch back to preview mode
      setIsCameraOpen(false);
      if (video.srcObject) {
         const stream = video.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  const handleSubmit = async () => {
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

  const MainContent = () => {
    if (result) {
      return (
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
      )
    }
    
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Analyzing receipt... this may take a moment.</p>
        </div>
      )
    }

    if (isCameraOpen) {
      return (
        <div className="space-y-4">
          <div className="relative mt-4 h-64 w-full rounded-md border bg-black flex items-center justify-center overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
               <Alert variant="destructive" className="w-auto m-4">
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please enable camera permissions.
                  </AlertDescription>
              </Alert>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <Button onClick={handleTakePicture} className="w-full" disabled={!hasCameraPermission}>
            <Camera className="mr-2 h-4 w-4" /> Take Picture
          </Button>
        </div>
      )
    }

    if (preview) {
      return (
        <div className="space-y-4">
          <div className="relative mt-4 h-64 w-full rounded-md border border-dashed flex items-center justify-center overflow-hidden">
             <Image
              src={preview}
              alt="Receipt preview"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <Button onClick={() => setPreview(null)} variant="outline" className="w-full">
            <RefreshCcw className="mr-2 h-4 w-4" /> Choose a different image
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <label htmlFor="receipt-upload" className="block text-sm font-medium text-foreground">
          Upload or take a picture of your receipt.
        </label>
        <div className="flex items-center gap-2">
          <Button onClick={handleUseCamera} variant="outline" className="w-full">
            <Camera className="mr-2 h-4 w-4" /> Use Camera
          </Button>
          <div className="w-full">
            <Input id="receipt-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isLoading} className="hidden" />
            <label htmlFor="receipt-upload" className="w-full inline-block">
               <Button asChild className="w-full cursor-pointer">
                <span><Upload className="mr-2 h-4 w-4" /> Upload File</span>
              </Button>
            </label>
          </div>
        </div>
      </div>
    );
  }


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
            Use your camera or upload a file to automatically add items to your
            purchase history.
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4">
           <MainContent />
        </div>

        <DialogFooter className="sm:justify-between gap-2 mt-4">
          {result ? (
             <Button type="button" onClick={() => handleOpenChange(false)}>
              Add to History
            </Button>
          ) : (
            !isCameraOpen &&
            <Button type="button" onClick={handleSubmit} disabled={!preview || isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    