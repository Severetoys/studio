
"use client";

import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=BAAU2TSLG4Wyioj5tiQwmLHRE_Q20DoNhdSsZLDtWtU7v4mlPm3BeqYqg9-kk-aO3sjtPnwYBTuh-sWdsw&components=hosted-buttons&disable-funding=venmo&currency=BRL`;
        script.async = true;

        script.onload = () => {
            setIsLoading(false);
            if (window.paypal && buttonContainerRef.current) {
                window.paypal.HostedButtons({
                    hostedButtonId: hostedButtonId,
                }).render(buttonContainerRef.current);
            }
        };

        script.onerror = () => {
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Erro de Pagamento',
                description: 'Não foi possível carregar o botão do PayPal.',
            });
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [hostedButtonId, toast]);

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
            <div ref={buttonContainerRef} className={isLoading ? 'hidden' : ''} />
        </div>
    );
}

export default PayPalHostedButton;
