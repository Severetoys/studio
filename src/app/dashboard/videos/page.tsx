
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Twitter, Video, PlayCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { fetchTwitterMedia, type Tweet } from '@/ai/flows/twitter-flow';

// Este nome de usuário será usado para buscar o feed.
// Poderia vir de um banco de dados ou configuração no futuro.
const TWITTER_USERNAME = "ItaloSantosAM";

export default function VideosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const hasPaid = localStorage.getItem('hasPaid');
    if (hasPaid !== 'true') {
      toast({
          title: "Acesso Negado",
          description: "Você precisa fazer um pagamento para ver esta página.",
          variant: "destructive"
      });
      router.replace('/dashboard');
      return;
    }
    
    setHasAccess(true);
    
    const loadTweets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchTwitterMedia({ username: TWITTER_USERNAME });
        setTweets(result.tweets);
      } catch (e: any) {
        const errorMessage = e.message || "Ocorreu um erro desconhecido.";
        setError(`Não foi possível carregar o feed do Twitter. Motivo: ${errorMessage}`);
        toast({
          variant: 'destructive',
          title: 'Erro de Integração com o Twitter',
          description: errorMessage,
        });
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTweets();
  }, [router, toast]);

  if (!isClient || !hasAccess) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Verificando acesso...</p>
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
              <CardDescription>Seu feed exclusivo do X (Twitter) está liberado abaixo.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
                  <Twitter /> Feed do X (@{TWITTER_USERNAME})
                </CardTitle>
                
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Carregando feed do Twitter...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-destructive bg-destructive/10 rounded-lg p-4">
                        <p className="font-semibold">Erro ao carregar o feed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                
                {!isLoading && !error && tweets.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg">
                        <p>Nenhum tweet com mídia encontrado recentemente para @{TWITTER_USERNAME}.</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tweets.map((tweet) => (
                            <div key={tweet.id} className="space-y-3 group">
                                {tweet.media && tweet.media[0] && (
                                    <div className="overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 relative">
                                        <Image 
                                          src={tweet.media[0].type === 'video' ? tweet.media[0].preview_image_url || "https://placehold.co/600x400.png" : tweet.media[0].url || "https://placehold.co/600x400.png"} 
                                          alt={`Mídia do tweet ${tweet.id}`} 
                                          width={600} 
                                          height={400} 
                                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                          data-ai-hint="social media content"
                                        />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayCircle className="h-16 w-16 text-white" />
                                        </div>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">{tweet.text}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
