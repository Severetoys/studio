
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  aiHint: string;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  { id: 1, name: "Sessão de Fotos Exclusiva", price: 250.00, image: "https://placehold.co/600x400.png", aiHint: "photo session" },
  { id: 2, name: "Vídeo Personalizado (5 min)", price: 350.00, image: "https://placehold.co/600x400.png", aiHint: "video recording" },
  { id: 3, name: "Acessório de Couro Artesanal", price: 180.00, image: "https://placehold.co/600x400.png", aiHint: "leather accessory" },
  { id: 4, name: "Kit de Fetiche Iniciante", price: 450.00, image: "https://placehold.co/600x400.png", aiHint: "fetish kit" },
  { id: 5, name: "Poster Autografado", price: 99.00, image: "https://placehold.co/600x400.png", aiHint: "autographed poster" },
  { id: 6, name: "Consulta de Dominação (30 min)", price: 500.00, image: "https://placehold.co/600x400.png", aiHint: "dominant figure" },
];

export default function LojaPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center flex-row items-center justify-between">
          <div></div>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light">
            Marketplace
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
                <SheetTitle className="text-2xl text-primary text-shadow-neon-red-light">Seu Carrinho</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                {cart.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Seu carrinho está vazio.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-4 -mr-4 mt-4">
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-start gap-4">
                           <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full" data-ai-hint={item.aiHint}/>
                           </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
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
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                         <Button 
                            className="w-full h-12 text-lg bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" 
                            disabled={cart.length === 0}
                            onClick={() => router.push('/auth')}
                         >
                            Finalizar Compra
                        </Button>
                    </div>
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {mockProducts.map(product => (
            <Card key={product.id} className="overflow-hidden bg-card/50 border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 flex flex-col">
              <CardHeader className="p-0">
                 <div className="aspect-video bg-muted overflow-hidden">
                    <Image src={product.image} alt={product.name} width={600} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint={product.aiHint}/>
                 </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                 <CardDescription className="text-primary font-semibold text-xl mt-2">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 mt-auto">
                <Button className="w-full h-11 bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" onClick={() => addToCart(product)}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
