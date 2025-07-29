
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AssinanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs on the client and checks for authentication status.
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') || localStorage.getItem('hasPaid') || localStorage.getItem('hasSubscription');
    const isAuth = authStatus === "true";
    setIsAuthenticated(isAuth);

    if (!isAuth) {
      toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Você precisa estar logado ou ter uma assinatura ativa para acessar esta página.',
      });
      router.replace('/'); // Redirect to home page if not authenticated
    }
    
    setIsLoading(false);
  }, [router, toast]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Verificando acesso...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
     // This part will briefly show while the redirect is happening.
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <p className="text-muted-foreground">Redirecionando...</p>
        </div>
    );
  }

  // If authenticated, render the layout for the subscriber area.
  return (
    <>
      {children}
    </>
  );
}

    