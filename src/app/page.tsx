
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Fingerprint, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { verifyFace } from '@/ai/flows/face-auth-flow';

export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access, which is required for Face ID.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
          description: 'Please enable camera permissions in your browser settings to use FaceID.',
        });
      }
    };
    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isClient, toast]);

  
  const handleFaceIdLogin = async () => {
    if (!hasCameraPermission) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Please grant camera access and wait for it to initialize.',
        });
        return;
    }
    
    // Definitive Fix: Ensure the video stream is actively playing and has valid dimensions.
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      toast({
          variant: 'destructive',
          title: 'Initialization Error',
          description: 'Camera is still initializing. Please try again in a moment.',
      });
      return;
    }

    setIsVerifying(true);
    toast({ title: 'Verifying Face ID...', description: 'Please look at the camera.' });

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg');
        
        try {
            const result = await verifyFace({ liveImage: imageBase64 });
            if (result.isMatch) {
                toast({ title: 'Face ID Verified!', description: 'Redirecting to dashboard.' });
                router.push('/dashboard');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Face ID Failed',
                    description: result.reason || 'Could not verify your identity. Please try again.',
                });
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'An Error Occurred',
                description: error.message || 'Something went wrong during Face ID verification.',
            });
        } finally {
            setIsVerifying(false);
        }
    } else {
        toast({
            variant: 'destructive',
            title: 'Canvas Error',
            description: 'Could not capture image from video stream.',
        });
        setIsVerifying(false);
    }
  };


  const AuthMethodButton = ({ icon, children, onClick, disabled }: { icon: React.ReactNode, children: React.ReactNode, onClick?: () => void, disabled?: boolean }) => (
    <Button variant="outline" className="w-full justify-center h-12 text-base" onClick={onClick} disabled={disabled}>
      {icon}
      <span className="flex-1 text-center">{children}</span>
    </Button>
  );

  const VideoPanel = () => (
    <div className="relative mx-auto w-full max-w-sm h-64 bg-muted rounded-lg overflow-hidden border">
      {isClient ? (
        <>
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          {!hasCameraPermission && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
              <Alert variant="destructive" className="bg-destructive/80 text-destructive-foreground border-destructive-foreground/50">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">Loading Camera...</p>
        </div>
      )}
    </div>
  );

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background font-sans">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            AuthKit
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Secure Face Authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <VideoPanel />
            <AuthMethodButton onClick={handleFaceIdLogin} icon={<Fingerprint className="w-5 h-5" />} disabled={!hasCameraPermission || isVerifying}>
              {isVerifying ? 'Verifying...' : 'Sign in with Face ID'}
            </AuthMethodButton>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Copyright © AuthKit 2025 - All rights reserved.</p>
      </footer>
    </main>
  );
}
