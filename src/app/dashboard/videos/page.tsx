
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video } from 'lucide-react';

export default function VideosPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasPaid = localStorage.getItem('hasPaid');
    if (hasPaid !== 'true') {
      // Se não pagou, redireciona de volta ao painel.
      router.replace('/dashboard');
    }
  }, [router]);
  
  // Renderiza um placeholder ou nada enquanto verifica o acesso para evitar flash de conteúdo.
  if (!isClient) {
    return null;
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl text-primary">Vídeos Exclusivos</CardTitle>
              <CardDescription>Seu acesso ao conteúdo premium está liberado.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar ao Painel</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
                <div className="overflow-hidden rounded-lg aspect-video bg-muted flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Vídeo 1: Introdução à Segurança</h3>
                <p className="text-sm text-muted-foreground">Aprenda os conceitos fundamentais para proteger seus dados e sistemas online.</p>
            </div>
             <div className="space-y-3">
                <div className="overflow-hidden rounded-lg aspect-video bg-muted flex items-center justify-center">
                     <Video className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Vídeo 2: Configuração Avançada</h3>
                <p className="text-sm text-muted-foreground">Explore técnicas avançadas de configuração para otimizar a segurança do seu ambiente.</p>
            </div>
            <div className="space-y-3">
                <div className="overflow-hidden rounded-lg aspect-video bg-muted flex items-center justify-center">
                     <Video className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Vídeo 3: Análise de Riscos</h3>
                <p className="text-sm text-muted-foreground">Como identificar, analisar e mitigar riscos de segurança em seus projetos.</p>
            </div>
             <div className="space-y-3">
                <div className="overflow-hidden rounded-lg aspect-video bg-muted flex items-center justify-center">
                     <Video className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Vídeo 4: Resposta a Incidentes</h3>
                <p className="text-sm text-muted-foreground">Passo a passo de como agir quando um incidente de segurança ocorre.</p>
            </div>
        </CardContent>
      </Card>
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
