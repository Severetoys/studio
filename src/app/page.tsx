
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';
import PaymentButtons from '@/components/payment-buttons';
import AuthModal from '@/components/auth-modal';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';

const features = [
    "Conteúdo exclusivo e sem censura.",
    "Acesso a vídeos e ensaios completos.",
    "Atualizações semanais com novas produções.",
    "Comunidade e interação direta.",
];

const FeatureList = () => (
    <div className="relative w-full overflow-hidden bg-background py-4">
        <div className="flex animate-marquee whitespace-nowrap">
            {features.map((feature, index) => (
                <span key={index} className="flex items-center mx-4 text-muted-foreground text-lg">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
            {features.map((feature, index) => (
                 <span key={`dup-${index}`} className="flex items-center mx-4 text-muted-foreground text-lg" aria-hidden="true">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
        </div>
    </div>
);


export default function HomePage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [price, setPrice] = useState<{ amount: number; currencyCode: string; currencySymbol: string } | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  useEffect(() => {
    const getLocalCurrency = async () => {
      try {
        const userLocale = navigator.language || 'pt-BR';
        const response = await convertCurrency({ targetLocale: userLocale });
        if (response) {
            setPrice(response);
        } else {
            setPrice({ amount: 99.00, currencyCode: 'BRL', currencySymbol: 'R$' });
        }
      } catch (error) {
        console.error("Failed to convert currency, defaulting to BRL.", error);
        setPrice({ amount: 99.00, currencyCode: 'BRL', currencySymbol: 'R$' });
      } finally {
        setIsLoadingPrice(false);
      }
    };
    getLocalCurrency();
  }, []);

  const PriceDisplay = () => {
    if (isLoadingPrice) {
      return (
        <div className="flex items-center justify-center h-[160px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
        </div>
      );
    }

    if (!price) {
      return null;
    }

    return (
        <div className="text-center animate-in fade-in-0 duration-500">
            <div className="flex justify-center items-baseline gap-2">
                <span className="text-5xl font-medium text-muted-foreground self-start mt-8">{price.currencySymbol}</span>
                <p className="text-9xl font-bold text-primary tracking-tight animate-pulse-glow">
                    {price.amount.toFixed(2).replace('.', ',')}
                </p>
                <span className="text-lg font-medium text-muted-foreground self-end mb-4">{price.currencyCode}</span>
            </div>
        </div>
    );
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="p-4 md:p-8 bg-background flex flex-col items-center gap-6 w-full max-w-md text-center">
          <Button 
              className="w-full h-20 bg-primary/90 hover:bg-primary text-primary-foreground text-3xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
              onClick={() => setIsAuthModalOpen(true)}>
              <Fingerprint className="h-12 w-12 mr-4" />
              Face ID
          </Button>
          
          <PaymentButtons amount={price ? price.amount.toString() : "99.00"} />
          
          <Separator className="w-full bg-border/30" />

          <PriceDisplay />
          
          <Button 
              className="w-full h-14 bg-primary/90 hover:bg-primary text-primary-foreground text-xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
              onClick={() => setIsAuthModalOpen(true)}>
              ENTRAR
          </Button>
        </div>
        <FeatureList />
        <AboutSection />
      </div>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
    
