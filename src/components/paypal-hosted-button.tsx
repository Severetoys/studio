
"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        paypal?: any;
    }
}

interface PayPalHostedButtonProps {
    onPaymentSuccess: () => void;
    hostedButtonId: string;
    children?: React.ReactNode;
}

const PayPalHostedButton = ({ onPaymentSuccess, hostedButtonId, children }: PayPalHostedButtonProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const [isSdkReady, setIsSdkReady] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        // Usar client-id de sandbox e componentes 'buttons'
        script.src = `https://www.paypal.com/sdk/js?client-id=test&components=buttons&disable-funding=venmo&currency=BRL`;
        script.async = true;

        script.onload = () => {
            setIsSdkReady(true);
            setIsLoading(false);
        };

        script.onerror = () => {
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Erro de Pagamento',
                description: 'Não foi possível carregar o SDK do PayPal.',
            });
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [toast]);
    
    useEffect(() => {
        if(isSdkReady && window.paypal && buttonContainerRef.current) {
             // Limpa o contêiner antes de renderizar para evitar botões duplicados
            buttonContainerRef.current.innerHTML = "";
            try {
                window.paypal.Buttons({
                    hostedButtonId: hostedButtonId,
                    onApprove: (data: any, actions: any) => {
                        return actions.order.capture().then((details: any) => {
                             toast({
                                title: "Pagamento Aprovado!",
                                description: `Obrigado pela sua compra, ${details.payer.name.given_name}.`,
                            });
                            onPaymentSuccess();
                        });
                    },
                    onError: (err: any) => {
                        console.error("Erro no botão do PayPal:", err);
                        toast({
                            variant: 'destructive',
                            title: 'Erro no Pagamento',
                            description: 'Ocorreu um erro ao processar seu pagamento. Tente novamente.',
                        });
                    }
                }).render(buttonContainerRef.current).catch((err: any) => {
                     console.error("Erro ao renderizar botão do PayPal: ", err);
                });
            } catch (error) {
                console.error("Exceção ao renderizar botão do PayPal: ", error);
            }
        }

    }, [isSdkReady, hostedButtonId, onPaymentSuccess, toast])


    // Use a custom button if children are provided
    if (children) {
        return (
            <div onClick={() => {
                const paypalButton = buttonContainerRef.current?.querySelector('div[role="button"]');
                if (paypalButton instanceof HTMLElement) {
                    paypalButton.click();
                } else {
                    toast({ variant: 'destructive', title: 'Erro', description: 'Botão de pagamento não está pronto.' });
                }
            }} className="cursor-pointer">
                {children}
                <div ref={buttonContainerRef} style={{ display: 'none' }}></div>
            </div>
        );
    }
    
    // Default visible PayPal button
    return (
        <div className="w-full max-w-xs mx-auto min-h-[40px]">
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
            )}
            <div ref={buttonContainerRef} className={cn("transition-opacity duration-500", isLoading ? 'opacity-0' : 'opacity-100')} />
        </div>
    );
}

export default PayPalHostedButton;
