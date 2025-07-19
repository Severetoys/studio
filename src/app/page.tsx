
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Fingerprint, ShieldCheck, UserPlus, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { verifyFace } from '@/ai/flows/face-auth-flow';

export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // State for registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      if (mediaStream && node.srcObject !== mediaStream) {
        node.srcObject = mediaStream;
      }
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!isClient) return;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setMediaStream(stream);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setMediaStream(null);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };
    if (!mediaStream) {
        getCameraPermission();
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    }
  }, [isClient, toast, mediaStream]);

  const captureImage = (): string | null => {
    if (!videoRef.current || videoRef.current.readyState < 3 || videoRef.current.videoWidth === 0) {
      toast({
          variant: 'destructive',
          title: 'Initialization Error',
          description: 'Camera is still initializing. Please try again in a moment.',
      });
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
    }
    
    toast({
        variant: 'destructive',
        title: 'Canvas Error',
        description: 'Could not capture image from video stream.',
    });
    return null;
  };
  
  const handleAuthAction = async (action: 'login' | 'register') => {
    if (!hasCameraPermission) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Please grant camera access and wait for it to initialize.',
        });
        return;
    }
    
    if (action === 'register' && (!name || !email || !phone)) {
      toast({
        variant: 'destructive',
        title: 'Form Incomplete',
        description: 'Please fill out all fields before registering.',
      });
      return;
    }

    setIsVerifying(true);
    toast({ title: 'Verifying Face ID...', description: 'Please look at the camera.' });

    const imageBase64 = captureImage();
    
    if (imageBase64) {
        try {
            const result = await verifyFace({ 
              liveImage: imageBase64,
              ...(action === 'register' && { name, email, phone })
            });

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
        setIsVerifying(false);
    }
  };

  const VideoPanel = () => (
    <div className="relative mx-auto w-full max-w-sm h-64 bg-muted rounded-lg overflow-hidden border border-primary/20 shadow-[0_0_20px_hsl(var(--primary))]">
      {isClient ? (
        <>
          <video ref={videoCallbackRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          {isVerifying && <div className="absolute inset-0 laser-scanner"></div>}
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

  const InputField = ({ id, label, icon, type, value, onChange }: { id: string, label: string, icon: React.ReactNode, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
        {icon} {label}
      </Label>
      <Input id={id} type={type} value={value} onChange={onChange} required className="h-11 bg-background/50 border-primary/30 focus:shadow-primary-glow" />
    </div>
  );

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background font-sans">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card/80 backdrop-blur-xl shadow-primary-glow">
        <CardHeader className="text-center pb-2">
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
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-primary/20">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
                <div className="space-y-4 pt-4">
                    <VideoPanel />
                    <Button onClick={() => handleAuthAction('login')} disabled={!hasCameraPermission || isVerifying} className="w-full justify-center h-12 text-base">
                      <Fingerprint className="w-5 h-5 mr-2" />
                      {isVerifying ? 'Verifying...' : 'Sign in with Face ID'}
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="signup">
                <div className="space-y-4 pt-4">
                    <InputField id="name" label="Full Name" icon={<UserPlus size={16} />} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    <InputField id="email" label="Email Address" icon={<Mail size={16} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField id="phone" label="Phone Number" icon={<Phone size={16} />} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <VideoPanel />
                     <Button onClick={() => handleAuthAction('register')} disabled={!hasCameraPermission || isVerifying} className="w-full justify-center h-12 text-base">
                      <Fingerprint className="w-5 h-5 mr-2" />
                      {isVerifying ? 'Verifying...' : 'Register with Face ID'}
                    </Button>
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Copyright © AuthKit 2025 - All rights reserved.</p>
      </footer>
    </main>
  );
}
