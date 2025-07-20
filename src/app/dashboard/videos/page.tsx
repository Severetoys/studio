
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, Loader2, Video } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, getDocs, Timestamp, orderBy, query } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  createdAt: Timestamp;
}


export default function VideosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const db = getFirestore(firebaseApp);
  const [isClient, setIsClient] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<VideoContent[]>([]);
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
    
    const fetchVideos = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const videosCollection = collection(db, "videos");
            const q = query(videosCollection, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const videosList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as VideoContent));
            setVideos(videosList);
        } catch (e: any) {
            const errorMessage = e.message || "Ocorreu um erro desconhecido.";
            setError(`Não foi possível carregar os vídeos. Motivo: ${errorMessage}`);
            toast({
                variant: 'destructive',
                title: 'Erro ao Carregar Conteúdo',
                description: errorMessage,
            });
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchVideos();
  }, [router, toast, db]);

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
              <CardDescription>Bem-vindo à sua área de membro. Todo o conteúdo abaixo está liberado.</CardDescription>
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
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Carregando vídeos...</p>
                </div>
            )}

            {error && (
                <div className="text-center py-20 text-destructive bg-destructive/10 rounded-lg p-4">
                    <p className="font-semibold">Erro ao carregar conteúdo</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            {!isLoading && !error && videos.length === 0 && (
                <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-lg">
                    <Video className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum vídeo exclusivo ainda</h3>
                    <p className="mt-1 text-sm">Novos vídeos para assinantes aparecerão aqui.</p>
                </div>
            )}

            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {videos.map((video) => (
                        <div key={video.id} className="space-y-3 group">
                            <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg aspect-video bg-muted border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 relative">
                                <Image 
                                  src={video.thumbnailUrl}
                                  alt={`Thumbnail para ${video.title}`} 
                                  width={600} 
                                  height={400} 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                  data-ai-hint="video thumbnail exclusive"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="h-16 w-16 text-white" />
                                </div>
                            </a>
                             <h3 className="text-xl font-semibold">{video.title}</h3>
                             <p className="text-sm text-muted-foreground">{video.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
