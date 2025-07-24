
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle, Loader2, KeyRound, Dices } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';
import AuthModal from '@/components/auth-modal';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';
import { useToast } from '@/hooks/use-toast';
import MercadoPagoButton from '@/components/mercadopago-button';

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
  const [isBrazil, setIsBrazil] = useState(true);

  useEffect(() => {
    const userLocale = navigator.language || 'pt-BR';
    setIsBrazil(userLocale.toLowerCase().includes('pt'));

    const getLocalCurrency = async () => {
      try {
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
  
  const handlePaymentSuccess = () => {
    localStorage.setItem('hasPaid', 'true');
    toast({
        title: "Pagamento Aprovado!",
        description: "Você será redirecionado para a autenticação para finalizar seu acesso."
    });
    // Redirect to auth page so user can register with face ID after paying
    router.push('/old-auth-page');
  }

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="h-6 w-6">
      <path d="M386 400c45-42 65-112 53-179H260v100h108c-10 60-56 100-118 100-72 0-130-58-130-130s58-130 130-130c34 0 63 14 86 36l76-75c-52-49-124-77-200-77-133 0-240 107-240 240s107 240 240 240c85 0 157-30 209-82l-75-76z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M19.39 10.22a4.34 4.34 0 0 0-4.11-2.95 4.54 4.54 0 0 0-4.22 3.23 2.5 2.5 0 0 0-2.3 2.75 2.54 2.54 0 0 0 2.54 2.52h8.15a2.55 2.55 0 0 0 2.55-2.52 2.63 2.63 0 0 0-2.6-2.98zm-4.32 1.45a.79.79 0 0 1 .18-.52.75.75 0 0 1 .55-.24.73.73 0 0 1 .54.24.77.77 0 0 1 .18.52.76.76 0 0 1-1.45 0zm4.22-3.66a2.68 2.68 0 0 1-2.36-1.39 2.52 2.52 0 0 1 .4-3.32 2.57 2.57 0 0 1 3.33.4 2.5 2.5 0 0 1-1.37 4.31z"/>
    </svg>
  );

  const PixIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M5.32,15.11,8.38,12,5.32,8.89h2.5L10.33,12,7.82,15.11Zm8.36,0,3.06-3.11-3.06-3.11h2.5L18.69,12,16.18,15.11ZM12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
    </svg>
  );

  const quickPayButtons = [
    { label: 'Google', Icon: GoogleIcon },
    { label: 'Pix', Icon: PixIcon },
    { label: 'Apple', Icon: AppleIcon },
  ].filter(btn => isBrazil || btn.label !== 'Pix');


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
            
             <div className="text-center py-4">
                {isLoadingPrice ? (
                     <div className="flex items-center justify-center h-[72px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                ) : (
                    priceInfo && (
                        <>
                          <div className="flex w-full">
                              {quickPayButtons.map(({ label, Icon }) => (
                                <MercadoPagoButton
                                  key={label}
                                  amount={priceInfo.amount}
                                  onSuccess={handlePaymentSuccess}
                                  isQuickPay={true}
                                  label={label}
                                  icon={Icon}
                                  customerInfo={{ name: 'Cliente', email: 'cliente@email.com' }}
                                  isBrazil={isBrazil}
                                />
                              ))}
                          </div>

                           <div className="text-center py-4">
                                <p className="text-muted-foreground">Assinatura Mensal</p>
                                <h3 className="font-bold text-8xl text-primary text-shadow-neon-red animate-pulse-glow">
                                    {priceInfo.amount.toFixed(2)}
                                    <span className="text-lg text-muted-foreground ml-1">{priceInfo.currencyCode}</span>
                                </h3>
                            </div>
                        </>
                    )
                )}
            </div>

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
    

    