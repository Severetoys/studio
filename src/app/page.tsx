
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
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createPayPalOrder, capturePayPalOrder, getPayPalClientId } from '@/ai/flows/paypal-payment-flow';
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
    
    const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState({ value: '99.00', currency: 'BRL' });
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);


    useEffect(() => {
        const fetchClientIdAndCurrency = async () => {
            try {
                const clientId = await getPayPalClientId();
                setPaypalClientId(clientId);

                const userLocale = navigator.language || 'pt-BR';
                const result = await convertCurrency({ targetLocale: userLocale });

                if (result.amount && result.currencyCode) {
                    setPaymentAmount({
                        value: result.amount.toFixed(2),
                        currency: result.currencyCode
                    });
                }
            } catch (error) {
                console.error("Failed to fetch PayPal client ID or currency", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro de Configuração',
                    description: 'Não foi possível carregar as opções de pagamento. Tente novamente mais tarde.',
                });
            }
        };

        fetchClientIdAndCurrency();
    }, [toast]);
    
    const openModal = (url: string, title: string) => {
        setModalState({ isOpen: true, url, title });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, url: '', title: '' });
    };

    const signupUrl = "https://script.google.com/macros/s/AKfycbwqPvDxA6iOnyOWG8UJt2cVgLNmjAebcBca2rQeXnOd99ARugf244OEXbZXuJt4K7P-/exec";
    const loginUrl = "https://script.google.com/macros/s/AKfycbwqPvDxA6iOnyOWG8UJt2cVgLNmjAebcBca2rQeXnOd99ARugf244OEXbZXuJt4K7P-/exec?page=login";

    const handlePaymentSuccess = () => {
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

            <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto">
                <Separator className="my-0 w-full bg-primary/50" />

                <div className="w-full max-w-xs flex flex-col items-center gap-y-6 pt-8">
                    <Button 
                        onClick={() => openModal(signupUrl, 'Cadastre-se com Face ID')}
                        className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transform scale-125 neon-red-glow"
                    >
                        <Fingerprint className="mr-2 h-6 w-6" />
                        Cadastre-se com Face ID
                    </Button>

                    <div className="flex justify-center items-center w-full max-w-full mt-4">
                        <div className="flex-1 transition-transform hover:scale-105" style={{ flexBasis: '42.5%'}}>
                           <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58%20(1).jpeg?alt=media&token=00683b6b-59ac-483c-93f4-6c879ab9b86c" alt="Google Pay" width={338} height={135} className="object-contain" style={{ transform: 'scale(2.7)' }}/>
                        </div>
                        <div className="flex-shrink-0 mx-4 flex flex-col items-center px-[15%]">
                            <button className="transition-transform hover:scale-105" onClick={() => setIsPixModalOpen(true)}>
                                 <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649" alt="PIX" width={28} height={14} className="object-contain" style={{ transform: 'scale(1.2)' }}/>
                            </button>
                            <p className="text-xs font-semibold mt-1">PIX</p>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap">APENAS BRASIL</p>
                        </div>
                        <div className="flex-1 transition-transform hover:scale-105" style={{ flexBasis: '42.5%'}}>
                           <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=3a91ba87-6df8-41db-a3bd-64f720e7feb2" alt="Apple Pay" width={338} height={135} className="object-contain" style={{ transform: 'scale(2.7)' }}/>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-lg">Assinatura Mensal</p>
                        <p className="text-5xl font-bold text-red-500 animate-neon-blink" style={{ transform: 'scale(1.44)' }}>
                           {paymentAmount.currency === 'BRL' ? `R$ ${paymentAmount.value}` : `${paymentAmount.value} ${paymentAmount.currency}`}
                        </p>
                    </div>
                     
                     <div className="w-full">
                         {paypalClientId && (
                            <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: paymentAmount.currency }}>
                                <PayPalButtons
                                    style={{ layout: "horizontal", color: "gold", shape: "rect", label: "paypal", tagline: false, height: 44 }}
                                    createOrder={async (data, actions) => {
                                        toast({ title: 'Criando sua ordem de pagamento...' });
                                        const res = await createPayPalOrder({ 
                                            amount: parseFloat(paymentAmount.value), 
                                            currencyCode: paymentAmount.currency 
                                        });
                                        if (res.orderID) {
                                            return res.orderID;
                                        } else {
                                            toast({ variant: 'destructive', title: 'Erro', description: res.error });
                                            throw new Error(res.error);
                                        }
                                    }}
                                    onApprove={async (data, actions) => {
                                        toast({ title: 'Processando pagamento...' });
                                        if (actions.order) {
                                            const res = await capturePayPalOrder({ orderID: data.orderID });
                                            if (res.success) {
                                                toast({ title: 'Pagamento Aprovado!', description: 'Seja bem-vindo(a) ao conteúdo exclusivo!' });
                                                handlePaymentSuccess();
                                            } else {
                                                 toast({ variant: 'destructive', title: 'Falha na Captura', description: res.error });
                                            }
                                        }
                                    }}
                                    onError={(err: any) => {
                                        console.error("Erro no PayPal:", err);
                                        toast({ variant: 'destructive', title: 'Erro no Pagamento', description: 'Ocorreu um erro. Verifique os detalhes e tente novamente.' });
                                    }}
                                    key={paymentAmount.currency} // Re-render buttons if currency changes
                                />
                            </PayPalScriptProvider>
                        )}
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
