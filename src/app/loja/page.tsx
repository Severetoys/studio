
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Instagram, Facebook, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Script from 'next/script';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchInstagramShopFeed, type InstagramMedia } from '@/ai/flows/instagram-shop-flow';
import { fetchFacebookProducts, type FacebookProduct } from '@/ai/flows/facebook-products-flow';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription as AlertDesc } from '@/components/ui/alert';

interface Video {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  videoUrl: string;
  aiHint?: string;
}

const InstagramShopFeed = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [media, setMedia] = useState<InstagramMedia[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getFeed = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchInstagramShopFeed();
                if (response.error) {
                    setError(`Não foi possível carregar as fotos do Instagram. Motivo: ${response.error}`);
                } else {
                    const photosOnly = response.media.filter(m => m.media_type === 'IMAGE' && m.media_url);
                    setMedia(photosOnly);
                }
            } catch (e: any) {
                const errorMessage = e.message || "Ocorreu um erro desconhecido.";
                setError(`Não foi possível carregar as fotos do Instagram. Motivo: ${errorMessage}`);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Carregar o Feed da Loja',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };
        getFeed();
    }, [toast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (error) {
       return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Não foi possível carregar o feed</AlertTitle>
                <AlertDesc>{error}</AlertDesc>
            </Alert>
        );
    }
    
    if (media.length === 0) return <p className="text-muted-foreground text-center">Nenhuma foto encontrada no Instagram da loja.</p>;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map((item) => (
                <a key={item.id} href={item.permalink} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
                    <Image src={item.media_url!} alt={item.caption || 'Instagram Post'} width={300} height={300} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" data-ai-hint="instagram shop product"/>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.caption && <p className="text-white text-xs font-bold line-clamp-2">{item.caption}</p>}
                    </div>
                </a>
            ))}
        </div>
    );
};

const FacebookProductsStore = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<FacebookProduct[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchFacebookProducts();
                if(response.error) {
                    setError(`Não foi possível carregar os produtos do Facebook. Motivo: ${response.error}`);
                } else {
                    setProducts(response.products);
                }
            } catch (e: any) {
                const errorMessage = e.message || "Ocorreu um erro desconhecido.";
                setError(`Não foi possível carregar os produtos do Facebook. Motivo: ${errorMessage}`);
                toast({
                    variant: 'destructive',
                    title: 'Erro ao Carregar Catálogo',
                    description: errorMessage,
                });
            } finally {
                setIsLoading(false);
            }
        };
        getProducts();
    }, [toast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Não foi possível carregar o catálogo</AlertTitle>
                <AlertDesc>{error}</AlertDesc>
            </Alert>
        );
    }
    
    if (products.length === 0) return <p className="text-muted-foreground text-center">Nenhum produto encontrado no catálogo do Facebook.</p>;


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                <Card key={product.id} className="overflow-hidden bg-card/50 border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 flex flex-col group">
                     <CardHeader className="p-0">
                        <div className="aspect-video bg-muted overflow-hidden">
                           <Image src={product.image_url} alt={product.name} width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint="facebook catalog product"/>
                        </div>
                     </CardHeader>
                     <CardContent className="p-4 flex-1 flex flex-col">
                        <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1 flex-grow">{product.description}</CardDescription>
                         <p className="text-primary font-semibold text-xl mt-2">{product.price}</p>
                     </CardContent>
                     <CardFooter className="p-4 mt-auto">
                        <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300">
                           <a href={product.url} target="_blank" rel="noopener noreferrer">
                                <Facebook className="mr-2 h-5 w-5" />
                                Ver no Facebook
                           </a>
                        </Button>
                     </CardFooter>
                </Card>
            ))}
        </div>
    );
};


export default function LojaPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const videosCollection = collection(db, "videos");
        const q = query(videosCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const videosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Video));
        setVideos(videosList);
        
      } catch (error) {
        console.error("Error fetching videos: ", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar a loja",
          description: "Não foi possível buscar os vídeos.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [toast]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Script src="https://www.paypal.com/sdk/js?client-id=AZ6S85gBFj5k6V8_pUx1R-nUoJqL-3w4l9n5Z6G8y7o9W7a2Jm-B0E3uV6KsoJAg4fImv_iJqB1t4p_Q&components=cart-buttons" />
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between border-b border-primary/20 pb-4">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center flex-1">
            Adult Store
          </CardTitle>
          <div id="paypal-view-cart-button-container">
            <div className="paypal-cart-button-container">
                <div id="paypal-view-cart" className="paypal-button" data-paypal-style="color-yellow,size-large,shape-rect,label-cart,layout-horizontal"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-12">
            <div>
              <CardTitle className="text-2xl text-primary text-shadow-neon-red-light flex items-center gap-3 mb-4">
                <ShoppingCart /> Vídeos da Loja
              </CardTitle>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Carregando vídeos...</p>
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(video => (
                    <Card key={video.id} className="overflow-hidden bg-card/50 border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 flex flex-col group">
                      <CardHeader className="p-0">
                         <div className="aspect-video bg-muted overflow-hidden">
                            <Image src={video.thumbnailUrl} alt={video.title} width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint="video thumbnail"/>
                         </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <CardTitle className="text-lg text-foreground">{video.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground mt-1 flex-grow">{video.description}</CardDescription>
                         <p className="text-primary font-semibold text-xl mt-2">
                          {video.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 mt-auto">
                        <div id={`paypal-add-to-cart-button-container-${video.id}`}>
                           <div
                             id={`paypal-add-to-cart-${video.id}`}
                             className="paypal-button"
                             data-paypal-style="color-gold,size-large,shape-rect,label-cart,layout-horizontal"
                             data-paypal-product="name={{video.title}},price={{video.price.toFixed(2)}},currency=BRL"
                           ></div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                  <p className="mt-4 text-xl font-semibold text-muted-foreground">Nenhum vídeo disponível no momento.</p>
                  <p className="text-sm text-muted-foreground">Volte em breve para novidades!</p>
                </div>
              )}
            </div>

           <Separator className="my-8 bg-primary/20" />
            
            <div>
                <CardTitle className="text-2xl text-blue-500 flex items-center gap-3 mb-4">
                    <Facebook /> Catálogo do Facebook
                </CardTitle>
                <FacebookProductsStore />
            </div>

           <Separator className="my-8 bg-primary/20" />

            <div>
                <CardTitle className="text-2xl text-pink-500 flex items-center gap-3 mb-4">
                    <Instagram /> Galeria da Loja (@severetoys)
                </CardTitle>
                <InstagramShopFeed />
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
