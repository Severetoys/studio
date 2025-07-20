
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { PlayCircle, Video, Loader2, AlertCircle } from 'lucide-react';
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

const VideoCard = ({ video }: { video: VideoContent }) => {
  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl group">
      <CardHeader className="p-0">
        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video overflow-hidden rounded-t-lg bg-muted">
          <Image 
            src={video.thumbnailUrl} 
            alt={`Thumbnail for ${video.title}`} 
            width={600} 
            height={400} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            data-ai-hint="video thumbnail"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>
        </a>
      </CardHeader>
      <CardContent className="p-6">
         <h3 className="text-xl font-bold text-foreground">{video.title}</h3>
        <CardDescription className="mt-2 text-muted-foreground line-clamp-3">{video.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default function VendaAvulsaPage() {
    const { toast } = useToast();
    const db = getFirestore(firebaseApp);
    const [isLoading, setIsLoading] = useState(true);
    const [videos, setVideos] = useState<VideoContent[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
                    title: 'Erro ao Carregar Vídeos',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideos();
    }, [toast, db]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
              <Video /> Vídeos Gratuitos
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Conteúdo gratuito gerenciado pelo administrador.</p>
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
                    <p className="text-sm">O administrador ainda não adicionou vídeos.</p>
                </div>
            ) : (
                videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))
            )}
      </div>
    </main>
  );
}
