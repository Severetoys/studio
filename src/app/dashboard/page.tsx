
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing, CreditCard, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Verifica se o usuário acabou de logar e tinha uma intenção de pagamento.
    if (localStorage.getItem('justLoggedIn') === 'true' && localStorage.getItem('paymentIntent') === 'true') {
      setIsPaid(true);
      localStorage.setItem('hasPaid', 'true');
      toast({
        title: 'Pagamento Confirmado!',
        description: 'Seu acesso foi liberado.',
      });
      // Limpa os marcadores para não repetir a ação
      localStorage.removeItem('justLoggedIn');
      localStorage.removeItem('paymentIntent');
    } else if (localStorage.getItem('hasPaid') === 'true') {
      setIsPaid(true);
    }
  }, []);

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    toast({ title: 'Redirecionando para autenticação...' });

    // Armazena a intenção de pagamento para usar após o login.
    localStorage.setItem('paymentIntent', 'true');
    localStorage.setItem('redirectAfterLogin', '/dashboard');
    router.push('/old-auth-page');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasPaid');
      localStorage.removeItem('justLoggedIn');
      localStorage.removeItem('paymentIntent');
    }
    router.push('/');
  };

  const ExclusiveContent = () => (
    <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl text-shadow-neon-red-light">Conteúdo Exclusivo</CardTitle>
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
                 <Button className="w-full h-11 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={() => router.push('/dashboard/videos')}>
                    Acessar Conteúdo Exclusivo <ArrowRight className="ml-2" />
                </Button>
             ) : (
                <Button className="w-full h-11 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={handlePayment} disabled={isProcessingPayment}>
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
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background gap-8">
       <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
             <CheckCircle className="h-12 w-12 text-primary text-shadow-neon-red" />
          </div>
           <CardTitle className="text-3xl text-shadow-neon-red-light">
                Login Bem-sucedido
            </CardTitle>
          <CardDescription>Bem-vindo ao seu painel seguro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-border pb-4">
            <Avatar className="h-16 w-16 border-2 border-primary/50">
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
                <UserIcon className="h-5 w-5 text-primary" />
                <p>
                    <span className="text-muted-foreground">Status: </span>
                    <strong>Verificado</strong>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <BellRing className="h-5 w-5 text-primary" />
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
    </main>
  );
}
