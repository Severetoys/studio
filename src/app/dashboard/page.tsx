
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing, CreditCard, Lock, PlayCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

// Simula um email de usuário logado. Em uma aplicação real, isso viria de uma sessão.
const FAKE_USER_EMAIL = "usuario.exemplo@email.com";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem('hasPaid') === 'true') {
      setIsPaid(true);
    }
  }, []);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    toast({ title: 'Processando pagamento...', description: 'Aguarde um momento.' });

    try {
      // Simula a geração de um ID de pagamento.
      const paymentId = `PAY-SIM-${Date.now()}`;

      // Chama o nosso próprio endpoint de webhook para simular um sistema de pagamento externo.
      const response = await fetch('/api/payment-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: FAKE_USER_EMAIL,
          paymentId: paymentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Falha ao processar o pagamento.');
      }

      toast({
        title: 'Pagamento bem-sucedido!',
        description: 'Seu acesso foi liberado.',
      });
      
      // Persiste o estado de pagamento no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasPaid', 'true');
      }
      setIsPaid(true);

    } catch (error: any) {
      console.error('Erro ao simular pagamento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Pagamento',
        description: error.message || 'Não foi possível concluir o pagamento. Tente novamente.',
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasPaid');
    }
    router.push('/');
  };

  const ExclusiveContent = () => (
    <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-accent/20 bg-card backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl">Conteúdo Exclusivo</CardTitle>
            <CardDescription>Acesse vídeos e tutoriais especiais.</CardDescription>
        </CardHeader>
        <CardContent>
            {isPaid ? (
                 <div className="text-center p-6 bg-green-500/10 rounded-lg border border-dashed border-green-500/30">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-4 text-lg font-semibold">Acesso Liberado!</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Você tem acesso a todo o nosso conteúdo exclusivo.
                    </p>
                </div>
            ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Este conteúdo está bloqueado</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Faça o pagamento para obter acesso imediato a todo o conteúdo exclusivo.
                    </p>
                </div>
            )}
        </CardContent>
        <CardFooter>
             {isPaid ? (
                 <Button className="w-full h-11 text-base" onClick={() => router.push('/dashboard/videos')}>
                    Acessar Conteúdo Exclusivo <ArrowRight className="ml-2" />
                </Button>
             ) : (
                <Button className="w-full h-11 text-base" onClick={handlePayment} disabled={isProcessingPayment}>
                    <CreditCard className="mr-2" />
                    {isProcessingPayment ? 'Processando...' : 'Pagar para Liberar Acesso'}
                </Button>
             )}
        </CardFooter>
    </Card>
  );

  if (!isClient) {
    return null; // Renderiza nada no servidor para evitar hydration mismatch
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background gap-8">
       <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-accent/20 bg-card backdrop-blur-xl shadow-[0_0_20px_hsl(var(--accent-shadow))]">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
             <CheckCircle className="h-12 w-12 text-accent" />
          </div>
           <CardTitle className="text-3xl">
                Login Bem-sucedido
            </CardTitle>
          <CardDescription>Bem-vindo ao seu painel seguro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-border pb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar do Usuário" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-2xl bg-muted">U</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">Usuário Autenticado</h2>
              <p className="text-sm text-muted-foreground">Acesso concedido via Face ID</p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-accent" />
                <p>
                    <span className="text-muted-foreground">Status: </span>
                    <strong>Verificado</strong>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <BellRing className="h-5 w-5 text-accent" />
                <p>
                    <span className="text-muted-foreground">Notificações: </span>
                    <strong>Ativadas</strong>
                </p>
            </div>
          </div>

          <Button className="w-full h-11 text-base" variant="secondary" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Sair
          </Button>
        </CardContent>
      </Card>
      
      <ExclusiveContent />

      <footer className="mt-8 text-center text-sm text-muted-foreground max-w-md w-full">
        <p>Copyrights © Italo Santos 2025 - Todos os direitos reservados</p>
        <p>
            <a href="#" className="underline hover:text-primary">Termos & Condições</a> | <a href="#" className="underline hover:text-primary">Política de Privacidade</a>
        </p>
        <p className="mt-2">Este site inclui conteúdo protegido por direitos autorais, é proibida reprodução total ou parcial deste conteúdo sem autorização prévia do proprietário do site.</p>
      </footer>
    </main>
  );
}
