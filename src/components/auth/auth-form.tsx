
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, GoogleIcon } from "./icons";
import { Mail, MessageCircle, ScanFace, Loader2 } from "lucide-react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onAuthSuccess: () => void;
  onFaceAuthClick: () => void;
}

export function AuthForm({ onAuthSuccess, onFaceAuthClick }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    // Cleanup a verifier se o componente for desmontado
    return () => {
      recaptchaVerifier?.clear();
    };
  }, [recaptchaVerifier]);


  const handleAuthSuccess = () => {
    toast({
      title: "Authentication Successful!",
      description: "Redirecting to your dashboard...",
      className: "bg-accent text-accent-foreground border-accent",
    });
    router.push('/dashboard');
    onAuthSuccess();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will redirect
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will redirect
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Authentication Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const setupRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal', // Mudado para 'normal' (visível)
        'callback': (response: any) => {
          // reCAPTCHA resolvido, agora pode enviar o SMS
          handleSmsSubmit(verifier);
        },
        'expired-callback': () => {
          // A resposta expirou. O usuário precisa resolver o reCAPTCHA novamente.
          toast({
            variant: 'destructive',
            title: "reCAPTCHA Expired",
            description: "Please solve the reCAPTCHA again.",
          });
          recaptchaVerifier?.clear();
          setRecaptchaVerifier(null);
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  }

  const handleRecaptchaAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const verifier = setupRecaptcha();
      // Renderiza o reCAPTCHA. O callback 'callback' chamará handleSmsSubmit
      await verifier.render();
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: "reCAPTCHA Error",
        description: error.message,
      });
      setIsLoading(false);
    }
  }

  const handleSmsSubmit = async (verifier: RecaptchaVerifier) => {
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the code.",
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: "SMS Sending Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerificationCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setIsLoading(true);

    try {
      await confirmationResult.confirm(verificationCode);
      // onAuthStateChanged will redirect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Verification Failed",
        description: "The code you entered is incorrect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'apple') => {
    setIsLoading(true);
    let provider;

    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'apple') {
      provider = new OAuthProvider('apple.com');
    } else {
      setIsLoading(false);
      return;
    }

    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will redirect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Authentication Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500 border-accent/20 bg-black/30 backdrop-blur-xl shadow-[0_0_20px_hsl(var(--accent-shadow))]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{authMode === 'login' ? 'Welcome Back' : 'Create an Account'}</CardTitle>
        <CardDescription>
          {authMode === 'login' ? 'Choose your preferred method to sign in.' : 'Fill in your details to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 text-base" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
            Google
          </Button>
          <Button variant="outline" className="h-12 text-base" onClick={() => handleSocialLogin('apple')} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AppleIcon className="mr-2 h-5 w-5 fill-current" />}
            Apple
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="email" className="text-base">
              <Mail className="mr-2 h-4 w-4" /> Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-base">
              <MessageCircle className="mr-2 h-4 w-4" /> SMS
            </TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={handleEmailSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full h-11 text-base bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {authMode === 'login' ? 'Sign In' : 'Sign Up'} with Email
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="sms">
            {!confirmationResult ? (
              <form onSubmit={handleRecaptchaAndSend} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 555-555-5555" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading} />
                </div>
                <div id="recaptcha-container" className="flex justify-center"></div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerificationCodeSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input id="code" type="text" placeholder="123456" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify and Sign In'}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
        <Button variant="secondary" className="w-full h-12 text-base" onClick={onFaceAuthClick}>
          <ScanFace className="mr-2 h-5 w-5" />
          Authenticate with FaceID
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        {authMode === 'login' ? (
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <button onClick={() => setAuthMode('signup')} className="text-primary hover:underline font-semibold">
              Sign Up
            </button>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button onClick={() => setAuthMode('login')} className="text-primary hover:underline font-semibold">
              Sign In
            </button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
