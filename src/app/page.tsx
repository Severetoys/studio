
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

import { AuthForm } from "@/components/auth/auth-form";
import { KycForm } from "@/components/auth/kyc-form";
import { AuthKitLogo } from "@/components/auth/icons";
import { FaceAuthModal } from "@/components/auth/face-auth-modal";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isFaceAuthOpen, setIsFaceAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);
  
  const handleSuccessfulAuth = () => {
    // KYC form can be triggered here if needed, or redirect directly
    // For now, onAuthStateChanged will handle the redirect.
     setIsKycOpen(true);
  };
  
  const handleFaceAuthClick = () => {
    setIsFaceAuthOpen(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Skeleton className="h-[550px] w-full max-w-md" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
       <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="flex items-center space-x-3">
          <AuthKitLogo className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">Italo SantoS</h1>
        </div>
        <p className="max-w-md text-muted-foreground">
          A beautifully designed, world-class authentication page.
        </p>
      </div>
      <div className="w-full max-w-md mt-8">
        <AuthForm onAuthSuccess={handleSuccessfulAuth} onFaceAuthClick={handleFaceAuthClick} />
      </div>
      <KycForm isOpen={isKycOpen} onOpenChange={setIsKycOpen} />
      <FaceAuthModal isOpen={isFaceAuthOpen} onOpenChange={setIsFaceAuthOpen} />
    </main>
  );
}
