
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Twitter, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { fetchTwitterMedia, type Tweet } from '@/ai/flows/twitter-flow';

const TWITTER_USERNAME = "ItaloSantosAM";

const VideoCard = ({ tweet }: { tweet: Tweet }) => {
  const media = tweet.media?.[0];
  if (!media) return null;

  const thumbnailUrl = media.preview_image_url || "https://placehold.co/600x400.png";

  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl group">
      <CardHeader className="p-0">
        <a href={`https://twitter.com/${TWITTER_USERNAME}/status/${tweet.id}`} target="_blank" rel="noopener noreferrer" className="block relative aspect-video overflow-hidden rounded-t-lg bg-muted">
          <Image src={thumbnailUrl} alt={`Thumbnail for tweet ${tweet.id}`} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="video thumbnail" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>
        </a>
      </CardHeader>
      <CardContent className="p-6">
        <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{tweet.text}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default function VendaAvulsaPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [videos, setVideos] = useState<Tweet[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVideos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchTwitterMedia({ username: TWITTER_USERNAME });
                // Filtra para manter apenas tweets que contenham pelo menos um vídeo
                const videoTweets = result.tweets.filter(tweet => 
                    tweet.media?.some(m => m.type === 'video' || m.type === 'animated_gif')
                );
                setVideos(videoTweets);
            } catch (e: any) {
                const errorMessage = e.message || "Ocorreu um erro desconhecido.";
                setError(`Não foi possível carregar os vídeos do Twitter. Motivo: ${errorMessage}`);
                toast({
                    variant: 'destructive',
                    title: 'Erro de Integração com o Twitter',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadVideos();
    }, [toast]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
              <Twitter /> Vídeos do Feed
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Conteúdo gratuito diretamente do meu feed do Twitter.</p>
        </div>
        <div className="w-full max-w-4xl space-y-12">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Carregando vídeos de @{TWITTER_USERNAME}...</p>
                </div>
            ) : error ? (
                 <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/10 rounded-lg p-4">
                    <AlertCircle className="h-12 w-12" />
                    <p className="mt-4 font-semibold">Erro ao carregar o feed</p>
                    <p className="text-sm text-center">{error}</p>
                </div>
            ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                    <p>Nenhum vídeo encontrado recentemente para @{TWITTER_USERNAME}.</p>
                </div>
            ) : (
                videos.map((tweet) => (
                  <VideoCard key={tweet.id} tweet={tweet} />
                ))
            )}
      </div>
    </main>
  );
}
