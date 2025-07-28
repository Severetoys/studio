
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createPayPalOrder, capturePayPalOrder, getPayPalClientId } from '@/ai/flows/paypal-payment-flow';

declare global {
    interface Window {
        paypal?: any;
    }
}

interface PayPalHostedButtonProps {
    onPaymentSuccess: () => void;
    currencyCode: string;
    amount: string;
    isCustomButton?: boolean;
    children?: React.ReactNode;
}

const PayPalHostedButton = ({ onPaymentSuccess, currencyCode, amount, isCustomButton = false, children }: PayPalHostedButtonProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [clientId, setClientId] = useState<string | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const id = await getPayPalClientId();
                if (id) {
                    setClientId(id);
                } else {
                    throw new Error("Client ID do PayPal não foi encontrado.");
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Erro de Configuração do PayPal', description: error.message });
                setIsLoading(false);
            }
        };
        fetchClientId();
    }, [toast]);
    
    const renderPayPalButton = useCallback(() => {
        if (!window.paypal || !buttonRef.current || !clientId) {
            console.warn("PayPal SDK or button container or Client ID not ready.");
            return;
        }
        
        buttonRef.current.innerHTML = '';
        
        try {
             window.paypal.Buttons({
                style: {
                    layout: 'horizontal',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal',
                    tagline: false,
                    height: 40
                },
                createOrder: async () => {
                    try {
                        const { orderID, error } = await createPayPalOrder({ amount, currencyCode });
                        if (error) throw new Error(error);
                        if (!orderID) throw new Error("ID da ordem não recebido.");
                        return orderID;
                    } catch (err: any) {
                         toast({ variant: 'destructive', title: 'Erro do Servidor', description: err.message });
                         throw err;
                    }
                },
                onApprove: async (data: { orderID: string }) => {
                    try {
                        const result = await capturePayPalOrder({ orderID: data.orderID });
                        if (result.success) {
                            onPaymentSuccess();
                        } else {
                            throw new Error(result.error || "Falha ao capturar o pagamento.");
                        }
                    } catch (err: any) {
                         toast({ variant: 'destructive', title: 'Erro na Aprovação', description: err.message });
                    }
                },
                onError: (err: any) => {
                    toast({ variant: 'destructive', title: 'Erro no PayPal', description: "Ocorreu um erro durante o checkout." });
                    console.error('Erro no checkout do PayPal:', err);
                }
            }).render(buttonRef.current);
        } catch (error) {
            console.error("Error rendering PayPal button", error);
        }
    }, [amount, currencyCode, onPaymentSuccess, toast, clientId]);

    useEffect(() => {
        if (!clientId) return;

        setIsLoading(true);
        const scriptId = 'paypal-sdk-script';
        
        if (document.getElementById(scriptId)) {
            if (window.paypal) {
                setIsLoading(false);
                renderPayPalButton();
            }
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&currency=${currencyCode}&intent=capture`;
        script.async = true;
        
        script.onload = () => {
            setIsLoading(false);
            renderPayPalButton();
        };
        
        script.onerror = () => {
            console.error("Failed to load PayPal SDK script.");
            setIsLoading(false);
            toast({ variant: 'destructive', title: "Erro ao carregar o botão de pagamento." });
        };

        document.body.appendChild(script);

    }, [clientId, currencyCode, renderPayPalButton, toast]);
    
    // Custom button logic: hides the PayPal button but uses its click event
    if (isCustomButton) {
        return (
            <div onClick={() => {
                const paypalButton = buttonRef.current?.querySelector('div[role="button"]');
                if (paypalButton instanceof HTMLElement) {
                    paypalButton.click();
                } else {
                    console.warn("Could not find the PayPal button to click.");
                }
            }} className="cursor-pointer">
                {children}
                <div ref={buttonRef} style={{ display: 'none' }}></div>
            </div>
        );
    }
    
    // Default visible button
    return (
        <div className="w-full max-w-xs mx-auto min-h-[40px]">
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
            )}
            <div ref={buttonRef} className={isLoading ? 'hidden' : ''} />
        </div>
    );
}

export default PayPalHostedButton;
