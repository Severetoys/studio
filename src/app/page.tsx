
"use client";

import { Button } from '@/components/ui/button';
import { Fingerprint, KeyRound, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import AccessTypeModal from '@/components/access-type-modal';

const PayPalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.74,2.42,7.36,5.1a.21.21,0,0,0,.2.23l2.88-.1a.21.21,0,0,1,.21.23L9.6,13.75a.21.21,0,0,0,.21.22l2.37-.08a.21.21,0,0,1,.21.23L11.23,21.8a.22.22,0,0,0,.21.21h2.82a.22.22,0,0,0,.22-.2l2-13.43a.22.22,0,0,0-.21-.24l-3.23.11a.22.22,0,0,1-.21-.24L12.7,2.42a.21.21,0,0,0-.21-.21H8a.21.21,0,0,0-.24.21Z"/>
        <path d="M10.87,14.57,11.82.93A.21.21,0,0,0,11.61.71H8.69a.21.21,0,0,0-.21.2L7.36,7.59a.22.22,0,0,0,.21.24l2.58-.09a.21.21,0,0,1,.21.23l-.93,6.3a.21.21,0,0,0,.21.22l2.74-.09a.21.21,0,0,0,.2-.23Z"/>
    </svg>
);


export default function Home() {
    const { toast } = useToast();
    const router = useRouter();
    const payPalRef = useRef<{ triggerPayment: () => void }>(null);
    
    const [paymentInfo, setPaymentInfo] = useState({ value: '99.00', currency: 'BRL', symbol: 'R$' });
    const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
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
        <>
             <div 
                className="relative w-full h-[50vh] flex items-center justify-center"
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

            <main className="flex-grow flex flex-col items-center w-full">
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto">
                    
                    <div className="w-full max-w-xs flex flex-col items-center gap-y-4 pt-4">
                         <Button asChild className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transform scale-125 neon-red-glow">
                            <Link href="https://cadastre-se.italosantos.com/" target="_blank">
                                <Fingerprint className="mr-2 h-6 w-6" />
                                Face ID
                            </Link>
                        </Button>

                         <div className="flex items-center justify-center w-full max-w-sm mt-6 gap-x-4">
                            <button className="flex-1 cursor-pointer bg-transparent border-none p-0 transition-transform hover:scale-105">
                                <Image
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58%20(1).jpeg?alt=media&token=1a720214-8238-4dfe-9aba-a820a9b883aa"
                                    alt="Payment button"
                                    width={242} 
                                    height={98}
                                    className="w-full h-auto object-contain"
                                />
                            </button>
                             <div className="flex flex-col items-center justify-center px-1">
                                <button
                                    className="transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setIsPixModalOpen(true)}
                                    aria-label="Pagar com PIX"
                                    disabled={!isBrazil || isLoadingCurrency}
                                >
                                    <Image
                                        src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649"
                                        alt="PIX"
                                        width={34}
                                        height={34}
                                        className="object-contain"
                                    />
                                </button>
                                <p className="text-[10px] text-muted-foreground mt-1 text-nowrap">PIX Brasil</p>
                            </div>
                            <button className="flex-1 cursor-pointer bg-transparent border-none p-0 transition-transform hover:scale-105">
                               <Image
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=7a8ad75a-e3d6-4c1f-98ea-0dd5e3ef8bbf"
                                    alt="Apple Pay"
                                    width={242} 
                                    height={98}
                                    className="w-full h-auto object-contain"
                                />
                            </button>
                        </div>

                        <div className="text-center py-4 min-h-[100px] flex flex-col items-center justify-center">
                            <p className="text-lg">Assinatura Mensal</p>
                             {isLoadingCurrency ? (
                                 <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                             ) : (
                                <p className="text-7xl font-bold text-red-500 animate-neon-blink">
                                    {paymentInfo.value.split('.')[0]}
                                    <span className="text-4xl align-top">.{paymentInfo.value.split('.')[1]}</span>
                                    <span className="text-2xl font-normal align-top ml-1">{paymentInfo.symbol}</span>
                                </p>
                             )}
                            <div className="w-full h-14 mt-4">
                                <Button className="w-full h-14 text-xl bg-[#0070BA] hover:bg-[#005ea6] text-white flex items-center justify-center neon-red-glow" onClick={() => payPalRef.current?.triggerPayment()}>
                                    <PayPalIcon />
                                    <span className="ml-2">PayPal</span>
                                </Button>
                                <div className="hidden">
                                     <PayPalHostedButton
                                        ref={payPalRef}
                                        hostedButtonId="2J4J3Z2Y5X2D8"
                                        onPaymentSuccess={handlePaymentSuccess}
                                     />
                                </div>
                            </div>
                        </div>
                        
                         <Button 
                            className="w-full h-14 text-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center neon-red-glow"
                            onClick={() => setIsAccessModalOpen(true)}
                         >
                            <KeyRound className="mr-2 h-6 w-6" />
                            ENTRAR
                        </Button>
                    </div>
                </div>
            
                <FeatureMarquee />
                <AboutSection />
            </main>

            <PixPaymentModal 
                isOpen={isPixModalOpen}
                onOpenChange={setIsPixModalOpen}
                amount={parseFloat(paymentInfo.value)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            <AccessTypeModal 
                isOpen={isAccessModalOpen}
                onOpenChange={setIsAccessModalOpen}
            />
        </>
    );

}
