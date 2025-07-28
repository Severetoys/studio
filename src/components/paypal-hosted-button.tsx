
"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
    interface Window {
        paypal?: any;
    }
}

interface PayPalHostedButtonProps {
    onPaymentSuccess: () => void;
    currencyCode: string;
    amount: string;
}

const PayPalHostedButton = ({ onPaymentSuccess, currencyCode, amount }: PayPalHostedButtonProps) => {
    const [isSdkReady, setIsSdkReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const scriptId = 'paypal-sdk-script';

        // Clean up previous instances if any
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            existingScript.remove();
        }
        const buttonContainer = document.getElementById('paypal-button-container');
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
        }

        const script = document.createElement('script');
        script.id = scriptId;
        // Use your Production Client ID here
        script.src = `https://www.paypal.com/sdk/js?client-id=AZ6S85gBFj5k6V8_pUx1R-nUoJqL-3w4l9n5Z6G8y7o9W7a2Jm-B0E3uV6KsoJAg4fImv_iJqB1t4p_Q&components=buttons&currency=${currencyCode}&intent=capture`;
        script.async = true;
        
        script.onload = () => {
            setIsSdkReady(true);
            setIsLoading(false);
        };
        
        script.onerror = () => {
            console.error("Failed to load PayPal SDK script.");
            setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            const scriptInDom = document.getElementById(scriptId);
            if (scriptInDom) {
                scriptInDom.remove();
            }
        };
    }, [currencyCode]); // Rerun when currency changes

    useEffect(() => {
        if (isSdkReady && window.paypal) {
            const buttonContainer = document.getElementById('paypal-button-container');
            if (buttonContainer) {
                buttonContainer.innerHTML = ''; // Clear previous button
                try {
                    window.paypal.Buttons({
                        createOrder: (data: any, actions: any) => {
                            return actions.order.create({
                                purchase_units: [{
                                    description: "Assinatura Mensal - Italo Santos",
                                    amount: {
                                        value: amount,
                                        currency_code: currencyCode,
                                    }
                                }]
                            });
                        },
                        onApprove: async (data: any, actions: any) => {
                            const order = await actions.order.capture();
                            console.log("Pagamento aprovado:", order);
                            onPaymentSuccess();
                        },
                        onError: (err: any) => {
                            console.error('Erro no checkout do PayPal:', err);
                        }
                    }).render('#paypal-button-container');
                } catch (error) {
                    console.error("Error rendering PayPal button", error);
                }
            }
        }
    }, [isSdkReady, amount, currencyCode, onPaymentSuccess]);

    return (
        <div className="w-full max-w-xs mx-auto min-h-[50px]">
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 </div>
            )}
            <div id="paypal-button-container" className={isLoading ? 'hidden' : ''} />
        </div>
    );
}

export default PayPalHostedButton;
