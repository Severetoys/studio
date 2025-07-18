
"use client";

import { useState, useEffect, useRef } from "react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function SmsAuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isVerifierReady, setIsVerifierReady] = useState(false);
  
  const { toast } = useToast();
  const auth = getAuth(app);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  
  // This effect will run once when the component mounts, creating the verifier.
  useEffect(() => {
    // Check if the verifier has already been created.
    if (recaptchaVerifierRef.current) return;

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal',
      'callback': () => {
        setIsVerifierReady(true);
      },
      'expired-callback': () => {
        toast({
          variant: 'destructive',
          title: "reCAPTCHA Expired",
          description: "Please solve the reCAPTCHA again.",
        });
        setIsVerifierReady(false);
      }
    });

    recaptchaVerifierRef.current = verifier;
    verifier.render();

    // Cleanup function to clear the verifier when the component unmounts.
    return () => {
      verifier.clear();
      recaptchaVerifierRef.current = null;
    };
  }, [auth, toast]);


  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!recaptchaVerifierRef.current) {
        toast({
            variant: 'destructive',
            title: 'reCAPTCHA not ready',
            description: 'Please complete the reCAPTCHA challenge.'
        });
        setIsLoading(false);
        return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
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
      // onAuthStateChanged in page.tsx will handle the redirect
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

  if (!confirmationResult) {
    return (
      <form onSubmit={handleSmsSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+1 555-555-5555" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isLoading} />
        </div>
        <div id="recaptcha-container" className="flex justify-center my-4"></div>
        <Button type="submit" className="w-full h-11 text-base" disabled={!isVerifierReady || isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Code'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerificationCodeSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="code">Verification Code</Label>
        <Input id="code" type="text" placeholder="123456" required value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} disabled={isLoading} />
      </div>
      <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify and Sign In'}
      </Button>
    </form>
  );
}
