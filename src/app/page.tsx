
"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Apple, Fingerprint, KeyRound, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { verifyFace } from '@/ai/flows/face-auth-flow';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);


export default function AuthPage() {
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
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
  }, [toast]);


  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in successfully", description: "Redirecting to your dashboard." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign in failed", description: error.message });
    }
  };
  
  const handleFaceIdLogin = async () => {
    if (!hasCameraPermission || !videoRef.current) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Please grant camera access and wait for it to initialize.',
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
            if (result.isMatch && result.token) {
                await signInWithCustomToken(auth, result.token);
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
    <Button variant="outline" className="w-full justify-start h-12 text-base" onClick={onClick} disabled={disabled}>
      {icon}
      <span className="flex-1 text-center">{children}</span>
    </Button>
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
            Secure and simple authentication for modern applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="relative mx-auto w-full max-w-sm h-64 bg-muted rounded-lg overflow-hidden border">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {!hasCameraPermission && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                          <p className="text-white text-center">Camera permission is required for Face ID.</p>
                      </div>
                    )}
                 </div>
                <AuthMethodButton onClick={handleGoogleSignIn} icon={<GoogleIcon />}>Sign in with Google</AuthMethodButton>
                <AuthMethodButton icon={<Apple className="w-5 h-5" />}>Sign in with Apple</AuthMethodButton>
                <AuthMethodButton onClick={handleFaceIdLogin} icon={<Fingerprint className="w-5 h-5" />} disabled={!hasCameraPermission || isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Sign in with Face ID'}
                </AuthMethodButton>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" placeholder="m@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                  <Input id="password-login" type="password" />
                </div>
                <Button className="w-full h-11 text-base">Sign In</Button>
              </div>
            </TabsContent>
            <TabsContent value="register">
              <div className="space-y-4">
                 <div className="relative mx-auto w-full max-w-sm h-64 bg-muted rounded-lg overflow-hidden border">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {!hasCameraPermission && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                        <Alert variant="destructive" className="bg-destructive/80 text-destructive-foreground border-destructive-foreground/50">
                          <AlertTitle>Camera Access Required</AlertTitle>
                          <AlertDescription>
                            Please allow camera access to register with Face ID.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                 </div>
                <AuthMethodButton icon={<Fingerprint className="w-5 h-5" />} disabled={!hasCameraPermission}>Register with Face ID</AuthMethodButton>
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input id="email-register" type="email" placeholder="m@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <Input id="password-register" type="password" />
                </div>
                <Button className="w-full h-11 text-base">Create Account</Button>
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

    