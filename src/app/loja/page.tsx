
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2, Facebook, Instagram, Loader2, Mail } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import MercadoPagoButton from '@/components/mercadopago-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

declare global {
  interface Window {
    FB: any;
  }
}

export default function LojaPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const db = getFirestore(firebaseApp);

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
  }, [db, toast]);

  const statusChangeCallback = (response: any) => {
    if (response.status === 'connected') {
      toast({
        title: "Login com Facebook bem-sucedido!",
        description: "Você foi autenticado com sucesso.",
      });
      // Aqui você pode buscar os dados do usuário, se necessário
      // FB.api('/me', function(response) { ... });
    } else {
      toast({
        variant: "destructive",
        title: "Login com Facebook falhou.",
        description: "Não foi possível autenticar com o Facebook.",
      });
    }
  };

  const checkLoginState = () => {
    if (window.FB) {
        window.FB.getLoginStatus(function(response: any) {
            statusChangeCallback(response);
        });
    } else {
        toast({ variant: "destructive", title: "SDK do Facebook não carregado."})
    }
  };

  const handleFacebookLogin = () => {
     if (window.FB) {
        window.FB.login(function(response: any){
            statusChangeCallback(response);
        }, {scope: 'public_profile,email'});
    } else {
        toast({ variant: "destructive", title: "SDK do Facebook não carregado."})
    }
  };

  const handleConnectSocial = (platform: string) => {
    if (platform === 'Facebook') {
      handleFacebookLogin();
    } else {
      toast({
        title: `Integração com ${platform}`,
        description: `A funcionalidade para conectar com ${platform} está em desenvolvimento.`,
      });
    }
  };

  const addToCart = (video: Video) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === video.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === video.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...video, quantity: 1 }];
    });
    toast({
        title: `${video.title} adicionado!`,
        description: "O item está no seu carrinho.",
    });
  };

  const updateQuantity = (videoId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== videoId);
      }
      return prevCart.map(item =>
        item.id === videoId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (videoId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== videoId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePaymentSuccess = async (details: any) => {
    toast({
      title: "Pagamento bem-sucedido!",
      description: `O pagamento ${details.id} foi concluído.`,
    });
    
    // Chama o webhook interno para registrar o pagamento na planilha
    try {
        await fetch('/api/payment-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentId: details.id,
                payer: {
                  name: customerName,
                  email: customerEmail,
                }
            }),
        });
    } catch (e) {
        console.error("Falha ao chamar o webhook interno", e);
        // A falha aqui não precisa ser mostrada ao usuário, pois o pagamento já foi feito.
        // Apenas logamos o erro.
    }

    setCart([]); // Limpa o carrinho
    setCustomerEmail(''); // Limpa o email
    setCustomerName(''); // Limpa o nome

    // Redireciona para a autenticação para liberar o conteúdo.
    router.push('/auth');
  };

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between border-b border-primary/20 pb-4">
          <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleConnectSocial('Facebook')}>
                  <Facebook className="mr-2 h-4 w-4" /> Conectar com Facebook
              </Button>
              <Button variant="outline" onClick={() => handleConnectSocial('Instagram')}>
                  <Instagram className="mr-2 h-4 w-4" /> Conectar com Instagram
              </Button>
          </div>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center flex-1">
            Marketplace de Vídeos
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
                            <div className="flex items-center gap-2 mt-2">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
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
                            <Label htmlFor="name">Nome</Label>
                            <Input id="name" placeholder="Seu nome completo" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={cart.length === 0}/>
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
                            />
                        </div>
                    </div>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    </main>
  );
}
