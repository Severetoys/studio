
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

// This page now only serves to redirect to the new auth page.
export default function AuthPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/old-auth-page');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecionando para a autenticação...</p>
    </div>
  );
}
