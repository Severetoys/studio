
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Twitter, Video } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function VideosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasPaid = localStorage.getItem('hasPaid');
    if (hasPaid === 'true') {
      setHasAccess(true);
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleConnectX = () => {
    toast({
      title: 'Em Desenvolvimento',
      description: 'A funcionalidade de integração com o X (Twitter) será implementada em breve.',
    });
  };

  if (!isClient || !hasAccess) {
    // Renderiza um placeholder ou nada enquanto verifica o acesso para evitar flash de conteúdo.
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
            <p>Verificando acesso...</p>
        </div>
    );
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl text-primary text-shadow-neon-red-light">Vídeos Exclusivos</CardTitle>
              <CardDescription>Seu acesso ao conteúdo premium está liberado.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" className="h-10" onClick={handleConnectX}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Conectar com X
              </Button>
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Voltar ao Painel</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="space-y-3 group">
                    <div className="overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                        <Image src="https://placehold.co/600x400.png" alt="Thumbnail Vídeo 1" width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="security concepts" />
                    </div>
                    <h3 className="text-lg font-semibold">Vídeo 1: Introdução à Segurança</h3>
                    <p className="text-sm text-muted-foreground">Aprenda os conceitos fundamentais para proteger seus dados e sistemas online.</p>
                </div>
                <div className="space-y-3 group">
                    <div className="overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                        <Image src="https://placehold.co/600x400.png" alt="Thumbnail Vídeo 2" width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="advanced configuration" />
                    </div>
                    <h3 className="text-lg font-semibold">Vídeo 2: Configuração Avançada</h3>
                    <p className="text-sm text-muted-foreground">Explore técnicas avançadas de configuração para otimizar a segurança do seu ambiente.</p>
                </div>
                <div className="space-y-3 group">
                    <div className="overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                        <Image src="https://placehold.co/600x400.png" alt="Thumbnail Vídeo 3" width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="risk analysis" />
                    </div>
                    <h3 className="text-lg font-semibold">Vídeo 3: Análise de Riscos</h3>
                    <p className="text-sm text-muted-foreground">Como identificar, analisar e mitigar riscos de segurança em seus projetos.</p>
                </div>
                <div className="space-y-3 group">
                    <div className="overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                        <Image src="https://placehold.co/600x400.png" alt="Thumbnail Vídeo 4" width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="incident response" />
                    </div>
                    <h3 className="text-lg font-semibold">Vídeo 4: Resposta a Incidentes</h3>
                    <p className="text-sm text-muted-foreground">Passo a passo de como agir quando um incidente de segurança ocorre.</p>
                </div>
            </div>

            <Separator />

            <div>
                <CardTitle className="text-2xl text-primary text-shadow-neon-red-light mb-4">Feed do X (Twitter)</CardTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center border border-primary/20 animate-pulse">
                            <Video className="h-10 w-10 text-muted-foreground" />
                        </div>
                    ))}
                </div>
                <p className="text-center text-muted-foreground mt-4 text-sm">A integração com o X (Twitter) está em desenvolvimento. Em breve, seu feed de mídia aparecerá aqui.</p>
            </div>

        </CardContent>
      </Card>
    </main>
  );
}
