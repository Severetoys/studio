
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Twitter, Video, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const feedVideos = [
  { id: 'vid_001', title: 'Vídeo do Feed: Fetiche de Pés', description: 'Uma exploração detalhada e artística da podolatria.', image: 'https://placehold.co/600x400.png', aiHint: 'sensual feet' },
  { id: 'vid_002', title: 'Vídeo do Feed: Sessão de Spanking', description: 'Disciplina e prazer em uma sessão de spanking intensa e consensual.', image: 'https://placehold.co/600x400.png', aiHint: 'impact play' },
  { id: 'vid_003', title: 'Vídeo do Feed: Jogo de Humilhação', description: 'Explore a dinâmica de poder com humilhação verbal e física.', image: 'https://placehold.co/600x400.png', aiHint: 'power exchange' },
];


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
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
            <p>Verificando acesso...</p>
        </div>
    );
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-5xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
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
            <Separator />
            <div>
                <CardTitle className="text-2xl text-primary text-shadow-neon-red-light mb-4 flex items-center gap-2">
                  <Twitter /> Feed do X (Acesso Total)
                </CardTitle>
                <CardDescription className="mb-6">Como assinante, você tem acesso liberado a todos os vídeos do feed.</CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {feedVideos.map((video) => (
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
                 <p className="text-center text-muted-foreground mt-8 text-sm">A integração com o X (Twitter) está em desenvolvimento. Em breve, seu feed de mídia aparecerá aqui automaticamente.</p>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
