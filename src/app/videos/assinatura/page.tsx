
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, PlayCircle, Star } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const subscriptionVideos = [
  { id: 'sub_vid_1', title: 'Tutorial Exclusivo de Shibari', description: 'Aprenda as amarrações básicas e avançadas com este guia completo.', image: 'https://placehold.co/600x400.png', aiHint: 'rope art' },
  { id: 'sub_vid_2', title: 'Sessão Completa de Wax Play', description: 'Assista a uma sessão real e aprenda as técnicas de segurança.', image: 'https://placehold.co/600x400.png', aiHint: 'candle wax' },
  { id: 'sub_vid_3', title: 'Introdução ao Findom', description: 'Entenda a psicologia e as práticas da dominação financeira.', image: 'https://placehold.co/600x400.png', aiHint: 'luxury money' },
  { id: 'sub_vid_4', title: 'Guia de Pet Play para Iniciantes', description: 'Explore o mundo do pet play com segurança e diversão.', image: 'https://placehold.co/600x400.png', aiHint: 'person collar' },
];

export default function AssinaturaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const subscriptionStatus = localStorage.getItem('hasSubscription');
    if (subscriptionStatus === 'true') {
      setHasSubscription(true);
    }
  }, []);

  const handleSubscribe = () => {
    toast({
      title: 'Redirecionando para autenticação...',
      description: 'Você precisa se autenticar para assinar.',
    });
    // Armazena a intenção de assinar para redirecionar após o login
    localStorage.setItem('redirectAfterLogin', '/videos/assinatura');
    router.push('/old-auth-page');
  };

  if (!isClient) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-4 bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!hasSubscription) {
    return (
      <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl text-center animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Lock className="h-16 w-16 text-primary text-shadow-neon-red" />
            </div>
            <CardTitle className="text-3xl text-shadow-neon-red-light">Acesso Exclusivo para Assinantes</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Este conteúdo é restrito para membros. Assine para ter acesso total e ilimitado a todos os vídeos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-6 rounded-lg border border-dashed border-primary/20">
              <h3 className="font-bold text-2xl text-primary">R$ 49,90 / mês</h3>
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

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-5xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl text-primary text-shadow-neon-red-light">Conteúdo para Assinantes</CardTitle>
              <CardDescription>Bem-vindo! Todo o conteúdo abaixo está liberado para você.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Meu Painel</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subscriptionVideos.map((video) => (
              <div key={video.id} className="space-y-3 group">
                <div className="overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 relative">
                  <Image src={video.image} alt={`Thumbnail ${video.title}`} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={video.aiHint} />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{video.title}</h3>
                <p className="text-sm text-muted-foreground">{video.description}</p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-shadow-neon-red-light">E muito mais em breve!</h3>
            <p className="text-muted-foreground mt-2">Novos vídeos adicionados toda semana exclusivamente para assinantes.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
