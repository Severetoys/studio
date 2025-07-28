
"use client";

import { Button } from '@/components/ui/button';
import { Fingerprint, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import FeatureMarquee from '@/components/feature-marquee';
import Image from 'next/image';
import AboutSection from '@/components/about-section';
import { Separator } from '@/components/ui/separator';
import GoogleScriptModal from '@/components/google-script-modal';
import MainFooter from '@/components/layout/main-footer';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';
import PixPaymentModal from '@/components/pix-payment-modal';

export default function Home() {
    const { toast } = useToast();
    const router = useRouter();
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        url: string;
        title: string;
    }>({
        isOpen: false,
        url: '',
        title: '',
    });
    
    const [paymentAmount, setPaymentAmount] = useState({ value: '99.00', currency: 'BRL' });
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);

    useEffect(() => {
        const fetchCurrency = async () => {
            try {
                const userLocale = navigator.language || 'pt-BR';
                const result = await convertCurrency({ targetLocale: userLocale });

                if (result.amount && result.currencyCode) {
                    setPaymentAmount({
                        value: result.amount.toFixed(2),
                        currency: result.currencyCode
                    });
                }
            } catch (error) {
                console.error("Failed to fetch currency", error);
            }
        };
        fetchCurrency();
    }, []);
    
    const openModal = (url: string, title: string) => {
        setModalState({ isOpen: true, url, title });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, url: '', title: '' });
    };

    const signupUrl = "https://script.google.com/macros/s/AKfycbwqPvDxA6iOnyOWG8UJt2cVgLNmjAebcBca2rQeXnOd99ARugf244OEXbZXuJt4K7P-/exec";
    const loginUrl = "https://script.google.com/macros/s/AKfycbwqPvDxA6iOnyOWG8UJt2cVgLNmjAebcBca2rQeXnOd99ARugf244OEXbZXuJt4K7P-/exec?page=login";

    const handlePaymentSuccess = () => {
        toast({ title: 'Pagamento bem-sucedido!', description: 'Seja bem-vindo(a) ao conteúdo exclusivo!' });
        localStorage.setItem('hasPaid', 'true');
        localStorage.setItem('hasSubscription', 'true');
        router.push('/dashboard');
    };

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
                    <Button 
                        onClick={() => openModal(signupUrl, 'Cadastro com Face ID')}
                        className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transform scale-125 neon-red-glow"
                    >
                        <Fingerprint className="mr-2 h-6 w-6" />
                        Face ID
                    </Button>

                     <div className="flex justify-around items-center w-full max-w-sm mt-4">
                        <div className="flex-1 scale-[2.43] flex justify-center">
                             <Image 
                                src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/google_pay.png?alt=media&token=c81c6204-6150-48b4-839d-4e945c58c290" 
                                alt="Google Pay" 
                                width={70} 
                                height={45} 
                                className="object-contain"
                            />
                        </div>
                        
                        <div className="flex-shrink-0 mx-2 flex flex-col items-center">
                            <button 
                                className="transition-transform hover:scale-105" 
                                onClick={() => setIsPixModalOpen(true)}
                                aria-label="Pagar com PIX"
                            >
                                <Image 
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649" 
                                    alt="PIX" 
                                    width={28} 
                                    height={28} 
                                    className="object-contain"
                                />
                            </button>
                        </div>
        
                        <div className="flex-1 scale-[2.43] flex justify-center">
                             <Image 
                                src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/apple_pay.png?alt=media&token=e1c03484-5f56-4c42-839b-890251390f7f" 
                                alt="Apple Pay" 
                                width={70} 
                                height={45} 
                                className="object-contain"
                            />
                        </div>
                        
                        <div className="flex-shrink-0 mx-2 flex flex-col items-center">
                             <Button
                                variant="ghost"
                                className="p-0 h-auto transition-transform hover:scale-105"
                                onClick={() => toast({ title: 'PayPal em breve!', description: 'Esta opção de pagamento será ativada em breve.' })}
                            >
                                <Image 
                                    src="https://w7.pngwing.com/pngs/398/990/png-transparent-paypal-logo-shopping-ecommerce-client-area-payment-gateway-service-paypal-text-payment-logo.png"
                                    alt="PayPal"
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                    data-ai-hint="paypal logo"
                                />
                            </Button>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-lg">Assinatura Mensal</p>
                        <p className="text-5xl font-bold text-red-500 animate-neon-blink" style={{ transform: 'scale(1.44)' }}>
                           {paymentAmount.currency === 'BRL' ? `R$${paymentAmount.value.replace('.', ',')}` : `${paymentAmount.value} ${paymentAmount.currency}`}
                        </p>
                    </div>

                    <Button 
                        onClick={() => openModal(loginUrl, 'Login')}
                        className="w-full h-14 text-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center neon-red-glow"
                    >
                        <KeyRound className="mr-2 h-6 w-6" />
                        ENTRAR
                    </Button>
                </div>
            </main>
            
            <FeatureMarquee />
            <AboutSection />
            <MainFooter />

            <GoogleScriptModal 
                isOpen={modalState.isOpen} 
                onOpenChange={closeModal} 
                title={modalState.title}
                url={modalState.url}
            />
            <PixPaymentModal
                isOpen={isPixModalOpen}
                onOpenChange={setIsPixModalOpen}
                amount={parseFloat(paymentAmount.value)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
