
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { PlayCircle, Video, Loader2, AlertCircle, Twitter } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { fetchTwitterFeed, type TweetWithMedia } from '@/ai/flows/twitter-flow';

interface Media {
  url?: string;
  preview_image_url?: string;
  type: string;
  media_key: string;
  variants?: { bit_rate?: number, content_type: string, url: string }[];
}

const VideoCard = ({ video, text }: { video: Media; text: string }) => {
    // Encontra a melhor variante de vídeo (maior bitrate)
    const videoVariant = video.variants
        ?.filter(v => v.content_type === 'video/mp4')
        .sort((a, b) => (b.bit_rate || 0) - (a.bit_rate || 0))[0];

    const videoUrl = videoVariant?.url;

    return (
        <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl group">
            <CardHeader className="p-0">
                <div className="block relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                    {videoUrl ? (
                         <video 
                            src={videoUrl} 
                            poster={video.preview_image_url} 
                            controls 
                            className="w-full h-full object-cover"
                         />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-center p-4">
                             <div className='flex flex-col items-center gap-2'>
                                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Vídeo não disponível para visualização direta.</p>
                             </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{text}</CardDescription>
            </CardContent>
        </Card>
    );
};

export default function VendaAvulsaPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [videos, setVideos] = useState<TweetWithMedia[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeed = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchTwitterFeed({ username: 'Severepics', maxResults: 100 });
                
                const tweetsWithVideos = response.tweets.map(tweet => ({
                  ...tweet,
                  media: tweet.media.filter(m => m.type === 'video' || m.type === 'animated_gif'),
                })).filter(tweet => tweet.media.length > 0);

                setVideos(tweetsWithVideos);
            } catch (e: any) {
                const errorMessage = e.message || "Ocorreu um erro desconhecido.";
                setError(`Não foi possível carregar os vídeos do Twitter. Motivo: ${errorMessage}`);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Carregar Vídeos',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeed();
    }, [toast]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
              <Twitter /> Vídeos do X
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Feed de vídeos diretamente do meu perfil.</p>
        </div>
        <div className="w-full max-w-4xl space-y-12">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Carregando vídeos...</p>
                </div>
            ) : error ? (
                 <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/10 rounded-lg p-4">
                    <AlertCircle className="h-12 w-12" />
                    <p className="mt-4 font-semibold">Erro ao carregar vídeos</p>
                    <p className="text-sm text-center">{error}</p>
                </div>
            ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                    <Video className="h-12 w-12" />
                    <p className="mt-4 text-lg font-semibold">Nenhum vídeo encontrado.</p>
                    <p className="text-sm">Parece que não há tweets com vídeos recentes.</p>
                </div>
            ) : (
                videos.flatMap(tweet => 
                    tweet.media.map(media => (
                        <VideoCard key={media.media_key} video={media} text={tweet.text} />
                    ))
                )
            )}
      </div>
    </main>
  );
}
