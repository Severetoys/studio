
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing, CreditCard, Lock, ArrowRight, Video, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [purchasedVideos, setPurchasedVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const db = getFirestore(firebaseApp);
  
  useEffect(() => {
    setIsClient(true);
    // Simula a verificação do status da assinatura
    if (localStorage.getItem('hasSubscription') === 'true' || localStorage.getItem('hasPaid') === 'true') {
        setHasSubscription(true);
    }
  }, []);

  useEffect(() => {
    const fetchPurchasedVideos = async () => {
      // Por enquanto, isso busca todos os vídeos. No futuro, buscaria apenas os comprados pelo usuário.
      setIsLoadingVideos(true);
      try {
        const videosCollection = collection(db, "videos");
        const q = query(videosCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const videosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Video));
        setPurchasedVideos(videosList);
      } catch (error) {
        console.error("Error fetching videos: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar vídeos comprados.",
        });
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchPurchasedVideos();
  }, [db, toast]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasPaid');
      localStorage.removeItem('hasSubscription');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('redirectAfterLogin');
    }
    router.push('/');
  };

  const UserProfileCard = () => (
     <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
             <Avatar className="h-20 w-20 border-2 border-primary/50">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar do Usuário" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-3xl bg-muted">U</AvatarFallback>
            </Avatar>
          </div>
           <CardTitle className="text-3xl text-shadow-neon-red-light">
                Bem-vindo(a)!
            </CardTitle>
          <CardDescription>Painel do Cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-primary" />
                <p><span className="text-muted-foreground">Status: </span><strong>Verificado</strong></p>
            </div>
            <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                <p><span className="text-muted-foreground">Email: </span><strong>usuario@exemplo.com</strong></p>
            </div>
        </CardContent>
        <CardFooter>
             <Button className="w-full h-11 text-base" variant="secondary" onClick={handleLogout}>
                <LogOut className="mr-2" />
                Sair
            </Button>
        </CardFooter>
      </Card>
  );

  const SubscriptionCard = () => (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl text-shadow-neon-red-light flex items-center gap-2"><Star /> Minha Assinatura</CardTitle>
            <CardDescription>Gerencie seu plano de assinatura mensal.</CardDescription>
        </CardHeader>
        <CardContent>
            {hasSubscription ? (
                 <div className="text-center p-6 bg-green-500/10 rounded-lg border border-dashed border-green-500/30">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-4 text-lg font-semibold">Plano Ativo</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Sua assinatura será renovada em: <strong>24/08/2024</strong>
                    </p>
                </div>
            ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Você não tem uma assinatura</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Assine para ter acesso a vídeos e tutoriais exclusivos.
                    </p>
                </div>
            )}
        </CardContent>
        <CardFooter>
             {hasSubscription ? (
                 <Button className="w-full h-11 text-base bg-secondary" onClick={() => router.push('/videos/assinatura')}>
                    Gerenciar Assinatura
                </Button>
             ) : (
                <Button className="w-full h-11 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={() => router.push('/videos/assinatura')}>
                    <CreditCard className="mr-2" />
                    Assinar Agora
                </Button>
             )}
        </CardFooter>
    </Card>
  );

  const PurchasedVideosCard = () => (
    <Card className="w-full animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
            <CardTitle className="text-2xl text-shadow-neon-red-light flex items-center gap-2"><Video /> Vídeos Comprados</CardTitle>
            <CardDescription>Acesse aqui os vídeos que você comprou avulso.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingVideos ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : purchasedVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {purchasedVideos.map(video => (
                        <div key={video.id} className="relative group overflow-hidden rounded-lg border border-primary/20">
                            <Image src={video.thumbnailUrl} alt={video.title} width={300} height={169} className="object-cover w-full aspect-video" data-ai-hint="purchased video"/>
                             <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <h3 className="font-bold text-white line-clamp-2">{video.title}</h3>
                                <Button size="sm" className="mt-2" onClick={() => router.push(`/dashboard/videos?id=${video.id}`)}>
                                    <PlayCircle className="mr-2 h-4 w-4"/>
                                    Assistir Agora
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed border-border">
                    <p className="text-muted-foreground">Você ainda não comprou nenhum vídeo avulso.</p>
                     <Button variant="link" onClick={() => router.push('/loja')}>Visitar a loja</Button>
                </div>
            )}
        </CardContent>
    </Card>
  );

  if (!isClient) {
    return null;
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-start p-4 bg-background gap-8">
       <div className="w-full max-w-md space-y-8">
            <UserProfileCard />
            <SubscriptionCard />
            <PurchasedVideosCard />
       </div>
    </main>
  );
}
