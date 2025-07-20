
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Twitter, AlertCircle } from 'lucide-react';
import Image from "next/image";
import { fetchTwitterMedia, type Tweet } from '@/ai/flows/twitter-flow';
import { useToast } from '@/hooks/use-toast';

const TWITTER_USERNAME = "Severepics";

export default function FotosPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchTwitterMedia({ username: TWITTER_USERNAME });
        // Filtra para manter apenas tweets que contenham pelo menos uma foto
        const photoTweets = result.tweets.filter(tweet => 
          tweet.media?.some(m => m.type === 'photo')
        );
        setPhotos(photoTweets);
      } catch (e: any) {
        const errorMessage = e.message || "Ocorreu um erro desconhecido.";
        setError(`Não foi possível carregar as fotos do Twitter. Motivo: ${errorMessage}`);
        toast({
          variant: 'destructive',
          title: 'Erro de Integração com o Twitter',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPhotos();
  }, [toast]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
            <Twitter /> Fotos do Feed
          </CardTitle>
          <CardDescription>Conteúdo gratuito diretamente do meu feed do Twitter.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando fotos de @{TWITTER_USERNAME}...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/10 rounded-lg p-4">
              <AlertCircle className="h-12 w-12" />
              <p className="mt-4 font-semibold">Erro ao carregar o feed</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <p>Nenhuma foto encontrada recentemente para @{TWITTER_USERNAME}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.flatMap(tweet => 
                tweet.media
                  ?.filter(m => m.type === 'photo' && m.url)
                  .map(mediaItem => (
                    <div key={mediaItem.url} className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
                      <Image
                        src={mediaItem.url!}
                        alt={tweet.text}
                        width={600}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint="social media photo"
                      />
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm line-clamp-2">{tweet.text}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
