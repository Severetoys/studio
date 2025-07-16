"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { KycForm } from "@/components/auth/kyc-form";
import { AuthKitLogo } from "@/components/auth/icons";

export default function Home() {
  const [isKycOpen, setIsKycOpen] = useState(false);

  const handleLoginSuccess = () => {
    // In a real app, this would be called after successful auth
    setIsKycOpen(true);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
       <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="flex items-center space-x-3">
          <AuthKitLogo className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tighter text-foreground">AuthKit</h1>
        </div>
        <p className="max-w-md text-muted-foreground">
          A beautifully designed, world-class authentication page. Click any login method to open the KYC form.
        </p>
      </div>
      <div className="w-full max-w-md mt-8">
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
      <KycForm isOpen={isKycOpen} onOpenChange={setIsKycOpen} />
    </main>
  );
}
