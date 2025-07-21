
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Camera, Twitter } from 'lucide-react';
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { fetchTwitterFeed } from '@/ai/flows/twitter-flow';

interface Media {
  url?: string;
  preview_image_url?: string;
  type: string;
  media_key: string;
}

interface TweetWithMedia {
  id: string;
  text: string;
  created_at?: string;
  media: Media[];
}

export default function FotosPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tweets, setTweets] = useState<TweetWithMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Substitua 'Severepics' pelo nome de usuário que deseja buscar
        const response = await fetchTwitterFeed({ username: 'Severepics' });
        
        // Filtra para garantir que apenas tweets com mídia do tipo 'photo' sejam incluídos
        const tweetsWithPhotos = response.tweets.map(tweet => ({
          ...tweet,
          media: tweet.media.filter(m => m.type === 'photo' && m.url),
        })).filter(tweet => tweet.media.length > 0);

        setTweets(tweetsWithPhotos);

      } catch (e: any) {
        const errorMessage = e.message || "Ocorreu um erro desconhecido.";
        setError(`Não foi possível carregar as fotos do Twitter. Motivo: ${errorMessage}`);
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar o Feed',
          description: errorMessage,
        });
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeed();
  }, [toast]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
            <Twitter /> Galeria de Fotos do X
          </CardTitle>
          <CardDescription>Feed de imagens diretamente do meu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando feed do X (Twitter)...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/10 rounded-lg p-4">
              <AlertCircle className="h-12 w-12" />
              <p className="mt-4 font-semibold">Erro ao carregar o feed</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          ) : tweets.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <Camera className="h-12 w-12" />
                <p className="mt-4 text-lg font-semibold">Nenhuma foto encontrada no feed.</p>
                <p className="text-sm">Parece que não há posts com imagens recentes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tweets.flatMap(tweet => 
                tweet.media.map((media) => (
                  media.url && (
                    <div key={media.media_key} className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
                      <Image
                        src={media.url}
                        alt={tweet.text}
                        width={600}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint="twitter feed image"
                      />
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-bold line-clamp-2">{tweet.text}</p>
                      </div>
                    </div>
                  )
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
