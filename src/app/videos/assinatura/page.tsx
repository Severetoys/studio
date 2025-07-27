
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AssinaturaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const subscriptionStatus = localStorage.getItem('hasSubscription') || localStorage.getItem('hasPaid');
    if (subscriptionStatus === 'true') {
      setHasSubscription(true);
      // Se o usuário já é assinante e acessa esta página, redireciona para o painel.
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubscribe = () => {
    toast({
      title: 'Redirecionando...',
      description: 'Complete o pagamento na página inicial para assinar.',
    });
    router.push('/');
  };

  if (!isClient || hasSubscription) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-4 bg-background">
        <p className="text-muted-foreground">Carregando ou redirecionando...</p>
      </div>
    );
  }

  // Esta página agora funciona como uma landing page para não-assinantes.
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl text-center animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Lock className="h-16 w-16 text-primary text-shadow-neon-red" />
          </div>
          <CardTitle className="text-3xl text-shadow-neon-red-light">Acesso Exclusivo para Assinantes</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Este conteúdo é restrito para membros. Assine para ter acesso total e ilimitado a todos os vídeos e tutoriais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 rounded-lg border border-dashed border-primary/20">
            <h3 className="font-bold text-2xl text-primary">R$ 99,00 / mês</h3>
            <p className="text-muted-foreground mt-2">Cancele a qualquer momento.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full h-14 text-xl bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={handleSubscribe}>
            <CreditCard className="mr-3" />
            Quero Assinar Agora
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
