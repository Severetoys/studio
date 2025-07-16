"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, LogIn, Camera } from "lucide-react";
import { registerFace, verifyFace } from "@/ai/flows/face-auth-flow";
import type { FaceAuthInput, FaceAuthOutput } from "@/ai/flows/face-auth";

interface FaceAuthModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type AuthMode = "login" | "register";

export function FaceAuthModal({ isOpen, onOpenChange }: FaceAuthModalProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [userId, setUserId] = useState("");

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setAuthMode(null);
    setUserId("");
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };
  
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!isOpen || authMode === null) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, authMode, toast]);

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  };

  const handleCapture = async () => {
    if (!userId) {
        toast({ variant: 'destructive', title: 'User ID is required.' });
        return;
    }
      
    const photoDataUri = captureFrame();
    if (!photoDataUri) {
      toast({ variant: "destructive", title: "Could not capture photo." });
      return;
    }

    setIsProcessing(true);

    try {
      const input: FaceAuthInput = { userId, photoDataUri };
      if (authMode === "register") {
        await registerFace(input);
        toast({ title: "Face Registered!", description: "You can now log in using your face." });
        handleOpenChange(false);
      } else if (authMode === "login") {
        const result: FaceAuthOutput = await verifyFace(input);
        if (result.isMatch) {
          toast({ title: "Login Successful!", description: result.reason });
          handleOpenChange(false);
        } else {
          toast({ variant: "destructive", title: "Login Failed", description: result.reason });
        }
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "An Error Occurred", description: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (authMode === null) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-2xl">Face Authentication</DialogTitle>
            <DialogDescription>
              Are you a new or returning user?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" size="lg" onClick={() => setAuthMode('register')}>
                <UserPlus className="mr-2" /> New User
            </Button>
            <Button size="lg" onClick={() => setAuthMode('login')}>
                <LogIn className="mr-2" /> Returning User
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl">{authMode === 'register' ? 'Register Your Face' : 'Log In with Face'}</DialogTitle>
          <DialogDescription>
            {authMode === 'register' ? 'Enter a unique User ID and capture a photo of your face.' : 'Enter your User ID and look at the camera to log in.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g., user123" />
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Alert variant="destructive" className="w-4/5">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser to use this feature.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setAuthMode(null)} disabled={isProcessing}>Back</Button>
          <Button onClick={handleCapture} disabled={!hasCameraPermission || isProcessing || !userId}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2" />}
            {authMode === 'register' ? 'Register' : 'Log In'}
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
