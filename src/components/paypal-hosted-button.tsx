
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
}

const PayPalHostedButton = ({ onPaymentSuccess, hostedButtonId }: PayPalHostedButtonProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const [isSdkReady, setIsSdkReady] = useState(false);

    useEffect(() => {
        const scriptId = 'paypal-sdk';
        if (document.getElementById(scriptId)) {
            setIsSdkReady(true);
            setIsLoading(false);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        // Use a generic client-id for the SDK, as the hosted button has its own auth.
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

    }, [toast]);
    
    useEffect(() => {
        if (isSdkReady && window.paypal?.Buttons && buttonContainerRef.current) {
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
