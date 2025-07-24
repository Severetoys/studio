
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Camera, Twitter, Instagram, Upload, PlayCircle } from 'lucide-react';
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { fetchTwitterFeed } from '@/ai/flows/twitter-flow';
import { fetchInstagramFeed } from '@/ai/flows/instagram-flow';
import { getFirestore, collection, getDocs, Timestamp, orderBy, query } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';

// Interfaces para os tipos de mídia
interface TwitterMedia {
  url?: string;
  preview_image_url?: string;
  type: string;
  media_key: string;
}

interface TweetWithMedia {
  id: string;
  text: string;
  created_at?: string;
  media: TwitterMedia[];
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
}

interface UploadedPhoto {
  id: string;
  title: string;
  imageUrl: string;
}

// Componente para a aba do Twitter
const TwitterFeed = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tweets, setTweets] = useState<TweetWithMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchTwitterFeed({ username: 'Severepics', maxResults: 50 });
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
          title: 'Erro ao Carregar o Feed do Twitter',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, [toast]);

  if (isLoading) return <FeedLoading message="Carregando feed do X (Twitter)..." />;
  if (error) return <FeedError message={error} />;
  if (tweets.length === 0) return <FeedEmpty message="Nenhuma foto encontrada no feed do Twitter." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tweets.flatMap(tweet => 
        tweet.media.map((media) => (
          media.url && (
            <div key={media.media_key} className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
              <Image src={media.url} alt={tweet.text} width={600} height={600} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-ai-hint="twitter feed image" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-bold line-clamp-2">{tweet.text}</p>
              </div>
            </div>
          )
        ))
      )}
    </div>
  );
};

// Componente para a aba do Instagram
const InstagramFeed = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFeed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchInstagramFeed({ userId: 'me' });
        // Filtra apenas por imagens, já que a aba é de fotos.
        const photosOnly = response.media.filter(m => m.media_type === 'IMAGE' && m.media_url);
        setMedia(photosOnly);
      } catch (e: any) {
        const errorMessage = e.message || "Ocorreu um erro desconhecido.";
         if (errorMessage.includes("INSTAGRAM_ACCESS_TOKEN")) {
           setError("A integração com o Instagram não foi configurada. Por favor, adicione o token de acesso no painel de administração ou no arquivo .env.");
         } else {
           setError(`Não foi possível carregar as fotos do Instagram. Motivo: ${errorMessage}`);
         }
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar o Feed do Instagram',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    getFeed();
  }, [toast]);

  if (isLoading) return <FeedLoading message="Carregando feed do Instagram..." />;
  if (error) return <FeedError message={error} />;
  if (media.length === 0) return <FeedEmpty message="Nenhuma foto encontrada no feed do Instagram." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {media.map((item) => (
        <a key={item.id} href={item.permalink} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
          <Image src={item.media_url!} alt={item.caption || 'Instagram Post'} width={600} height={600} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-ai-hint="instagram feed image"/>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.caption && <p className="text-white text-sm font-bold line-clamp-2">{item.caption}</p>}
          </div>
          {item.media_type === 'VIDEO' && <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-white/80" />}
        </a>
      ))}
    </div>
  );
};

// Componente para a aba de Uploads
const UploadsFeed = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
    const [error, setError] = useState<string | null>(null);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        const fetchPhotos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const photosCollection = collection(db, "photos");
                const q = query(photosCollection, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const photosList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as UploadedPhoto));
                setPhotos(photosList);
            } catch (e: any) {
                setError("Não foi possível carregar as fotos do servidor.");
                toast({
                    variant: "destructive",
                    title: "Erro ao Carregar Fotos",
                    description: "Houve um problema ao buscar as fotos enviadas.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPhotos();
    }, [db, toast]);

    if (isLoading) return <FeedLoading message="Carregando fotos enviadas..." />;
    if (error) return <FeedError message={error} />;
    if (photos.length === 0) return <FeedEmpty message="Nenhuma foto foi enviada ainda." />;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
                    <Image src={photo.imageUrl} alt={photo.title} width={600} height={600} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-ai-hint="uploaded gallery image"/>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-bold">{photo.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Componentes de estado reutilizáveis
const FeedLoading = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <p className="mt-4 text-muted-foreground">{message}</p>
  </div>
);

const FeedError = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/10 rounded-lg p-4">
    <AlertCircle className="h-12 w-12" />
    <p className="mt-4 font-semibold">Erro ao carregar</p>
    <p className="text-sm text-center">{message}</p>
  </div>
);

const FeedEmpty = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
    <Camera className="h-12 w-12" />
    <p className="mt-4 text-lg font-semibold text-center">{message}</p>
  </div>
);

export default function FotosPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
            <Camera /> Galeria de Fotos
          </CardTitle>
          <CardDescription>Feeds de imagens de várias fontes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="twitter" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-primary/20">
              <TabsTrigger value="twitter" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light"><Twitter className="h-4 w-4 mr-2"/>X (Twitter)</TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light"><Instagram className="h-4 w-4 mr-2"/>Instagram</TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light"><Upload className="h-4 w-4 mr-2"/>Uploads</TabsTrigger>
            </TabsList>
            <TabsContent value="twitter" className="pt-6">
              <TwitterFeed />
            </TabsContent>
            <TabsContent value="instagram" className="pt-6">
              <InstagramFeed />
            </TabsContent>
            <TabsContent value="uploads" className="pt-6">
                <UploadsFeed />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
