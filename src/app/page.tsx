
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

function VerifiedBadge(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="#25D366" 
      stroke="var(--background)" 
      strokeWidth="1.5"
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
      <path d="M8 12.5L10.5 15L16 9" />
    </svg>
  );
}


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
          <h1 className="text-4xl font-bold tracking-tighter text-foreground flex items-center gap-2">
            Italo Santos <VerifiedBadge className="h-7 w-7" />
          </h1>
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

