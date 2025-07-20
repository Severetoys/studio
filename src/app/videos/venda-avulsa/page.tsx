
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Lock, CreditCard, Twitter } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface IndividualVideo {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  aiHint: string;
}

// Esta lista agora representa o conteúdo do feed
const feedVideos: IndividualVideo[] = [
  { id: 'vid_001', title: 'Vídeo do Feed: Fetiche de Pés', description: 'Uma exploração detalhada e artística da podolatria.', price: 29.90, image: 'https://placehold.co/600x400.png', aiHint: 'sensual feet' },
  { id: 'vid_002', title: 'Vídeo do Feed: Sessão de Spanking', description: 'Disciplina e prazer em uma sessão de spanking intensa e consensual.', price: 39.90, image: 'https://placehold.co/600x400.png', aiHint: 'impact play' },
  { id: 'vid_003', title: 'Vídeo do Feed: Jogo de Humilhação', description: 'Explore a dinâmica de poder com humilhação verbal e física.', price: 49.90, image: 'https://placehold.co/600x400.png', aiHint: 'power exchange' },
];

const VideoCard = ({ video }: { video: IndividualVideo }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const unlockedStatus = localStorage.getItem(`video_${video.id}_unlocked`);
    if (unlockedStatus === 'true') {
      setIsUnlocked(true);
    }
  }, [video.id]);

  const handlePurchase = () => {
    toast({
      title: 'Redirecionando para autenticação...',
      description: `Você precisa se autenticar para comprar: ${video.title}`,
    });
    localStorage.setItem('purchaseIntent', video.id);
    localStorage.setItem('redirectAfterLogin', `/videos/venda-avulsa`);
    router.push('/auth');
  };

  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl group">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
          {isUnlocked ? (
            <>
              <Image src={video.image} alt={`Thumbnail ${video.title}`} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={video.aiHint} />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-16 w-16 text-white" />
              </div>
            </>
          ) : (
            <>
              <Image src={video.image} alt={`Thumbnail ${video.title}`} width={600} height={400} className="w-full h-full object-cover filter blur-md" data-ai-hint={video.aiHint} />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Lock className="h-16 w-16 text-primary" />
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-2xl text-shadow-neon-red-light">{video.title}</CardTitle>
        <CardDescription className="mt-2 text-muted-foreground">{video.description}</CardDescription>
      </CardContent>
      <CardFooter>
        {isUnlocked ? (
          <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg" disabled>
            <PlayCircle className="mr-3" />
            Acesso Liberado
          </Button>
        ) : (
          <Button className="w-full h-12 text-lg bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={handlePurchase}>
            <CreditCard className="mr-3" />
            Comprar por R$ {video.price.toFixed(2)}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function VendaAvulsaPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const checkPurchaseIntent = () => {
            const videoIdToUnlock = localStorage.getItem('purchaseIntent');
            const hasJustLoggedIn = localStorage.getItem('justLoggedIn');

            if (videoIdToUnlock && hasJustLoggedIn === 'true') {
                localStorage.setItem(`video_${videoIdToUnlock}_unlocked`, 'true');
                localStorage.removeItem('purchaseIntent');
                localStorage.removeItem('justLoggedIn'); 
                
                const video = feedVideos.find(v => v.id === videoIdToUnlock);
                
                window.location.reload(); 
            }
        };

        checkPurchaseIntent();
    }, []);

    if (!isClient) {
        return <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-4 bg-background"><p className="text-muted-foreground">Carregando...</p></div>;
    }

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
              <Twitter /> Feed para Venda Avulsa
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Compre acesso individual e permanente aos vídeos do meu feed.</p>
        </div>
        <div className="w-full max-w-4xl space-y-12">
            {feedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
      </div>
    </main>
  );
}
