
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
    
    const PayPalButton = () => (
        <div className="flex flex-col items-center gap-2">
            <style jsx>{`
                .pp-QH7F9FWD9SR8G {
                    text-align: center;
                    border: none;
                    border-radius: 1.5rem;
                    min-width: 11.625rem;
                    padding: 0 2rem;
                    height: 3.125rem;
                    font-weight: bold;
                    background-color: #FFD140;
                    color: #000000;
                    font-family: "Helvetica Neue", Arial, sans-serif;
                    font-size: 1.125rem;
                    line-height: 1.5rem;
                    cursor: pointer;
                }
            `}</style>
            <form action="https://www.paypal.com/ncp/payment/QH7F9FWD9SR8G" method="post" target="_blank" style={{ display: 'inline-grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem' }}>
                <input className="pp-QH7F9FWD9SR8G" type="submit" value="Comprar agora" />
                <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" />
                <section style={{ fontSize: '0.75rem' }}> Com tecnologia <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg" alt="paypal" style={{ height: '0.875rem', verticalAlign: 'middle' }} /></section>
            </form>
        </div>
    );

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

                     <div className="flex justify-center items-center w-full max-w-sm mt-6 gap-x-4">
                        <div className="flex-1 flex justify-center">
                             <a href="https://www.paypal.com/ncp/payment/QH7F9FWD9SR8G" target="_blank" rel="noopener noreferrer">
                                <Image 
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/google_pay.png?alt=media&token=c81c6204-6150-48b4-839d-4e945c58c290" 
                                    alt="Google Pay" 
                                    width={63} 
                                    height={40} 
                                    className="object-contain scale-[1.93]"
                                />
                            </a>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <button 
                                className="transition-transform hover:scale-105" 
                                onClick={() => setIsPixModalOpen(true)}
                                aria-label="Pagar com PIX"
                            >
                                <Image 
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649" 
                                    alt="PIX" 
                                    width={32} 
                                    height={32} 
                                    className="object-contain scale-115"
                                />
                            </button>
                            <p className="text-[10px] text-muted-foreground mt-1">PIX apenas Brasil</p>
                        </div>
        
                        <div className="flex-1 flex justify-center">
                             <a href="https://www.paypal.com/ncp/payment/QH7F9FWD9SR8G" target="_blank" rel="noopener noreferrer">
                                <Image 
                                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/apple_pay.png?alt=media&token=e1c03484-5f56-4c42-839b-890251390f7f" 
                                    alt="Apple Pay" 
                                    width={63} 
                                    height={40} 
                                    className="object-contain scale-[1.93]"
                                />
                            </a>
                        </div>
                    </div>

                    <div className="text-center py-4">
                        <p className="text-lg">Assinatura Mensal</p>
                        <p className="text-5xl font-bold text-red-500 animate-neon-blink" style={{ transform: 'scale(1.44)' }}>
                           {paymentAmount.currency === 'BRL' ? `R$${paymentAmount.value.replace('.', ',')}` : `${paymentAmount.value} ${paymentAmount.currency}`}
                        </p>
                    </div>

                    <PayPalButton />

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
