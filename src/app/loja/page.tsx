
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { ShoppingCart, Trash2, Loader2, Instagram, Facebook, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MercadoPagoButton from '@/components/mercadopago-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface CartItem extends Video {
  quantity: number;
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isBrazil, setIsBrazil] = useState(true); // Assume Brasil como padrão
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideosAndLocale = async () => {
      setIsLoading(true);
      try {
        // Busca os vídeos
        const videosCollection = collection(db, "videos");
        const q = query(videosCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const videosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Video));
        setVideos(videosList);
        
        // Verifica a localidade do usuário
        const userLocale = navigator.language || 'pt-BR';
        setIsBrazil(userLocale.toLowerCase().includes('pt'));

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

    fetchVideosAndLocale();
  }, [toast]);

  const addToCart = (video: Video) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === video.id);
      if (existingItem) {
        toast({
            title: "Item já está no carrinho",
            description: "A compra de vídeos é limitada a uma unidade por item.",
        });
        return prevCart;
      }
      return [...prevCart, { ...video, quantity: 1 }];
    });
    toast({
        title: `${video.title} adicionado!`,
        description: "O item está no seu carrinho.",
    });
  };

  const removeFromCart = (videoId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== videoId));
  };

  const totalItems = cart.length;
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePaymentSuccess = async (details: any) => {
    toast({
      title: "Pagamento bem-sucedido!",
      description: `O pagamento ${details.id || 'mock_id'} foi concluído. Redirecionando para sua área de vídeos.`,
    });
    
    // Webhook logic has been removed for now.
    // We can re-implement it later if needed.

    setCart([]);
    setCustomerEmail('');
    setCustomerName('');
    router.push('/assinante');
  };

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between border-b border-primary/20 pb-4">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center flex-1">
            Adult Store
          </CardTitle>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative h-12 px-6 border-primary/30 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                <ShoppingCart className="mr-2" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{totalItems} Itens</span>
                   <span className="text-xs text-muted-foreground">
                    {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-primary/50 text-card-foreground">
              <SheetHeader>
                <SheetTitle className="text-2xl text-primary text-shadow-neon-red-light">Checkout</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Seu carrinho está vazio.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-4 -mr-4 mt-4">
                    <SheetDescription>Confira seus itens e dados antes de finalizar a compra.</SheetDescription>
                    <div className="space-y-4 mt-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-start gap-4">
                           <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <Image src={item.thumbnailUrl} alt={item.title} width={80} height={80} className="object-cover w-full h-full" data-ai-hint={item.aiHint || 'video thumbnail'}/>
                           </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-primary">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <SheetFooter className="mt-auto pt-6 border-t border-primary/20">
                    <div className="w-full space-y-4">
                        <div className="flex justify-between font-bold text-lg mb-4">
                            <span>Total:</span>
                            <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" placeholder="Seu nome" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={cart.length === 0}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="seu.email@exemplo.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} disabled={cart.length === 0}/>
                        </div>
                        <div className="pt-4">
                            <MercadoPagoButton
                                amount={totalPrice}
                                onSuccess={handlePaymentSuccess}
                                disabled={cart.length === 0 || !customerEmail || !customerName}
                                customerInfo={{name: customerName, email: customerEmail}}
                                isBrazil={isBrazil}
                            />
                        </div>
                    </div>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
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
                        <Button className="w-full h-11 bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={() => addToCart(video)}>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Adicionar ao Carrinho
                        </Button>
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
