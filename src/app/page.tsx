"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle, Loader2, Apple, Wallet, KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';
import AuthModal from '@/components/auth-modal';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';
import { useToast } from '@/hooks/use-toast';

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
  const [priceInfo, setPriceInfo] = useState<{amount: number, currencyCode: string, currencySymbol: string} | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getLocalCurrency = async () => {
      try {
        const userLocale = navigator.language || 'pt-BR';
        const response = await convertCurrency({ targetLocale: userLocale });
        setPriceInfo(response);
      } catch (error) {
        console.error("Failed to convert currency, defaulting to BRL.", error);
        setPriceInfo({ amount: 99.00, currencyCode: 'BRL', currencySymbol: 'R$' });
      } finally {
        setIsLoadingPrice(false);
      }
    };
    getLocalCurrency();
  }, []);
  
  const handlePaymentClick = () => {
    toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A integração com Google/Apple Pay será implementada em breve."
    });
    // Futuramente, aqui iria a lógica para iniciar o pagamento via Google/Apple Pay
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="p-4 md:p-8 bg-background flex flex-col items-center gap-6 w-full max-w-md text-center">
          
          <div className="w-full space-y-4">
            <Button 
                className="w-full h-20 bg-primary/90 hover:bg-primary text-primary-foreground text-3xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
                onClick={() => setIsAuthModalOpen(true)}>
                <Fingerprint className="h-12 w-12 mr-4" />
                Face ID
            </Button>
            
            <div className="flex w-full gap-4">
                <Button 
                    onClick={handlePaymentClick}
                    disabled={isLoadingPrice}
                    className="w-1/2 h-14 bg-black hover:bg-neutral-800 text-white text-lg font-semibold border border-neutral-700 hover:border-neutral-500 transition-all duration-300 flex items-center gap-2"
                >
                    Google Pay
                </Button>
                <Button 
                    onClick={handlePaymentClick}
                    disabled={isLoadingPrice}
                    className="w-1/2 h-14 bg-black hover:bg-neutral-800 text-white text-lg font-semibold border border-neutral-700 hover:border-neutral-500 transition-all duration-300 flex items-center gap-2"
                >
                    <Apple className="h-7 w-7" /> Apple Pay
                </Button>
            </div>

            {isLoadingPrice ? (
                <div className="flex items-center justify-center h-[72px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            ) : (
                priceInfo && (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground">Assinatura Mensal</p>
                        <h3 className="font-bold text-8xl text-primary text-shadow-neon-red animate-pulse-glow">
                            {priceInfo.currencySymbol} {priceInfo.amount.toFixed(2)}
                            <span className="text-lg text-muted-foreground ml-1">{priceInfo.currencyCode}</span>
                        </h3>
                    </div>
                )
            )}

            <Button 
                className="w-full h-16 bg-primary/90 hover:bg-primary text-primary-foreground text-2xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
                onClick={() => setIsAuthModalOpen(true)}>
                <KeyRound className="h-10 w-10 mr-4" />
                ENTRAR
            </Button>
          </div>
        </div>
        <FeatureList />
        <AboutSection />
      </div>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
    
