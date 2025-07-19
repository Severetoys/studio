
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing, CreditCard, Lock, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isPaid, setIsPaid] = useState(false);

  const handlePayment = () => {
    // Em um aplicativo real, aqui você integraria um gateway de pagamento.
    // Para esta demonstração, vamos apenas simular o sucesso do pagamento.
    setIsPaid(true);
  };

  const ExclusiveContent = () => (
    <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-accent/20 bg-card backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl">Conteúdo Exclusivo</CardTitle>
            <CardDescription>Acesse vídeos e tutoriais especiais.</CardDescription>
        </CardHeader>
        <CardContent>
            {isPaid ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <PlayCircle className="h-8 w-8 text-accent" />
                        <div>
                            <h3 className="font-semibold">Vídeo 1: Introdução à Segurança</h3>
                            <p className="text-sm text-muted-foreground">Assista agora</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <PlayCircle className="h-8 w-8 text-accent" />
                        <div>
                            <h3 className="font-semibold">Vídeo 2: Configuração Avançada</h3>
                            <p className="text-sm text-muted-foreground">Assista agora</p>
                        </div>
                    </div>
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
        {!isPaid && (
            <CardFooter>
                 <Button className="w-full h-11 text-base" onClick={handlePayment}>
                    <CreditCard className="mr-2" />
                    Pagar para Liberar Acesso
                </Button>
            </CardFooter>
        )}
    </Card>
  );

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

          <Button className="w-full h-11 text-base" variant="secondary" onClick={() => router.push('/')}>
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
