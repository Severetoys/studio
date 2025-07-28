
"use client";

import { useEffect } from 'react';

interface PayPalHostedButtonProps {
    onPaymentSuccess: () => void;
    currencyCode: string;
    amount: string;
}

const PayPalHostedButton = ({ onPaymentSuccess, currencyCode, amount }: PayPalHostedButtonProps) => {

    useEffect(() => {
        const scriptId = 'paypal-sdk';
        if (document.getElementById(scriptId)) {
            // Se o script já existe, não precisa adicionar de novo
            // O React pode remontar o componente e tentar adicionar o script multiplas vezes
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=AZ6S85gBFj5k6V8_pUx1R-nUoJqL-3w4l9n5Z6G8y7o9W7a2Jm-B0E3uV6KsoJAg4fImv_iJqB1t4p_Q&components=buttons&currency=${currencyCode}`;
        
        script.onload = () => {
            if (window.paypal) {
                window.paypal.Buttons({
                    createOrder: function(data: any, actions: any) {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: amount
                                }
                            }]
                        });
                    },
                    onApprove: function(data: any, actions: any) {
                         if (actions.order) {
                            return actions.order.capture().then(function(details: any) {
                                onPaymentSuccess();
                            });
                        }
                    }
                }).render('#paypal-button-container');
            }
        };

        document.body.appendChild(script);

        return () => {
            const buttonContainer = document.getElementById('paypal-button-container');
            if(buttonContainer) {
                buttonContainer.innerHTML = '';
            }
        };

    }, [amount, currencyCode, onPaymentSuccess]);

    return (
        <div id="paypal-button-container" className="w-full max-w-xs mx-auto">
           {/* O botão do PayPal será renderizado aqui pelo script */}
        </div>
    );
}

export default PayPalHostedButton;
