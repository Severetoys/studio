
"use client";

import { Button } from '@/components/ui/button';
import { Fingerprint, KeyRound, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import FeatureMarquee from '@/components/feature-marquee';
import Image from 'next/image';
import AboutSection from '@/components/about-section';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';
import PixPaymentModal from '@/components/pix-payment-modal';
import Link from 'next/link';
import PayPalHostedButton from '@/components/paypal-hosted-button';
import MainFooter from '@/components/layout/main-footer';

export default function Home() {
    const { toast } = useToast();
    const router = useRouter();
    
    const [paymentInfo, setPaymentInfo] = useState({ value: '99.00', currency: 'BRL', symbol: 'R$' });
    const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [isBrazil, setIsBrazil] = useState(true);

    useEffect(() => {
        const fetchCurrency = async () => {
            setIsLoadingCurrency(true);
            try {
                const userLocale = navigator.language || 'pt-BR';
                setIsBrazil(userLocale.toLowerCase().includes('pt'));

                const result = await convertCurrency({ targetLocale: userLocale });

                if (result.amount && result.currencyCode) {
                    setPaymentInfo({
                        value: result.amount.toFixed(2),
                        currency: result.currencyCode,
                        symbol: result.currencySymbol
                    });
                }
            } catch (error) {
                console.error("Failed to fetch currency", error);
                // Mantém o valor padrão em BRL em caso de erro
            } finally {
                setIsLoadingCurrency(false);
            }
        };
        fetchCurrency();
    }, []);

    const handlePaymentSuccess = useCallback(() => {
        toast({ title: 'Pagamento bem-sucedido!', description: 'Seja bem-vindo(a) ao conteúdo exclusivo!' });
        localStorage.setItem('hasPaid', 'true');
        localStorage.setItem('hasSubscription', 'true');
        router.push('/assinante');
    }, [router, toast]);
    

    return (
        <div className="flex flex-col items-center min-h-screen text-center bg-black text-white p-4 overflow-x-hidden">
             <div 
                className="relative w-full h-[50vh] flex items-center justify-center -mx-4"
            >
                <Image
                    src="https://placehold.co/1200x400.png"
                    alt="Background"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-80"
                    data-ai-hint="male model"
                />
                <div 
                    className="relative border-4 border-red-500 p-4 bg-black/50"
                    style={{ boxShadow: '0 0 15px 5px rgba(255, 0, 0, 0.5)' }}
                >
                    <h1 
                        className="text-8xl md:text-9xl font-bold text-white"
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                    >
                        Italo Santos
                    </h1>
                </div>
            </div>

            <Separator className="my-0 w-full bg-primary/50" />

            <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto">
                
                <div className="w-full max-w-xs flex flex-col items-center gap-y-4 pt-4">
                     <Button asChild className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transform scale-125 neon-red-glow">
                        <Link href="https://cadastre-se.italosantos.com/" target="_blank">
                            <Fingerprint className="mr-2 h-6 w-6" />
                            Face ID
                        </Link>
                    </Button>

                     <div className="flex items-center justify-center w-full max-w-sm mt-6 gap-x-8">
                        <PayPalHostedButton
                            hostedButtonId="YOUR_GOOGLE_PAY_BUTTON_ID"
                            onPaymentSuccess={handlePaymentSuccess}
                        >
                            <Image
                                src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58%20(1).jpeg?alt=media&token=00683b6b-59ac-483c-93f4-6c879ab9b86c"
                                alt="Google Pay"
                                width={442}
                                height={177}
                                className="w-full h-auto object-contain cursor-pointer"
                            />
                        </PayPalHostedButton>
                         <div className="flex flex-col items-center justify-center">
                            <button
                                className="transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setIsPixModalOpen(true)}
                                aria-label="Pagar com PIX"
                                disabled={!isBrazil || isLoadingCurrency}
                            >
                                <Image
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649"
                                    alt="PIX"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </button>
                            <p className="text-[10px] text-muted-foreground mt-1">PIX apenas Brasil</p>
                        </div>
                        <PayPalHostedButton
                           hostedButtonId="YOUR_APPLE_PAY_BUTTON_ID"
                           onPaymentSuccess={handlePaymentSuccess}
                        >
                           <Image
                                src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=3a91ba87-6df8-41db-a3bd-64f720e7feb2"
                                alt="Apple Pay"
                                width={442}
                                height={177}
                                className="w-full h-auto object-contain cursor-pointer"
                            />
                        </PayPalHostedButton>
                    </div>

                    <div className="text-center py-4 min-h-[100px] flex flex-col items-center justify-center">
                        <p className="text-lg">Assinatura Mensal</p>
                         {isLoadingCurrency ? (
                             <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                         ) : (
                             <p className="text-5xl font-bold text-red-500 animate-neon-blink" style={{ transform: 'scale(1.44)' }}>
                                {paymentInfo.value.replace('.', ',')}
                                <span className="text-lg font-normal align-top ml-1">{paymentInfo.symbol}</span>
                             </p>
                         )}
                        <div className="mt-4">
                           <PayPalHostedButton
                                hostedButtonId="YOUR_MAIN_PAYPAL_BUTTON_ID"
                                onPaymentSuccess={handlePaymentSuccess}
                           />
                        </div>
                    </div>
                    
                     <Button asChild className="w-full h-14 text-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center neon-red-glow">
                        <Link href="https://login.italosantos.com" target="_blank">
                            <KeyRound className="mr-2 h-6 w-6" />
                            ENTRAR
                        </Link>
                    </Button>
                </div>
            </main>
            
            <FeatureMarquee />
            <AboutSection />
            <MainFooter />
        </div>
    );
}
