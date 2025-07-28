
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface VideoData {
  title: string;
  description: string;
  videoUrl: string;
}

function VideoPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const videoId = searchParams.get('id');

  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setError("Nenhum vídeo selecionado.");
      setIsLoading(false);
      return;
    }

    const fetchVideo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const videoDocRef = doc(db, 'videos', videoId);
        const videoDoc = await getDoc(videoDocRef);

        if (videoDoc.exists()) {
          setVideoData(videoDoc.data() as VideoData);
        } else {
          setError("Vídeo não encontrado. Pode ter sido removido.");
          toast({
            variant: "destructive",
            title: "Vídeo não encontrado",
          });
        }
      } catch (e) {
        console.error("Erro ao buscar vídeo:", e);
        setError("Ocorreu um erro ao carregar o vídeo.");
        toast({
          variant: "destructive",
          title: "Erro de Conexão",
          description: "Não foi possível buscar os dados do vídeo.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, toast]);

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        {isLoading ? (
          <CardContent className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando seu vídeo...</p>
          </CardContent>
        ) : error ? (
          <CardContent className="h-96 flex flex-col items-center justify-center text-destructive">
             <AlertCircle className="h-12 w-12" />
             <p className="mt-4 font-semibold">{error}</p>
          </CardContent>
        ) : videoData ? (
          <>
            <CardHeader>
              <CardTitle className="text-3xl text-shadow-neon-red-light">{videoData.title}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {videoData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-primary/20">
                <video
                  src={videoData.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  autoPlay
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
            </CardContent>
          </>
        ) : null}
        <CardFooter className="flex justify-start">
          <Button variant="outline" onClick={() => router.push('/assinante')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Painel
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}


export default function AssinanteVideosPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary"/></div>}>
            <VideoPlayer />
        </Suspense>
    );
}
