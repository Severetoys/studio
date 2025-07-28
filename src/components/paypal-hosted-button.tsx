
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
            // Se o script já existe, remove para recarregar com a moeda certa
             const existingScript = document.getElementById(scriptId);
             if(existingScript) {
                existingScript.remove();
             }
        }

        const script = document.createElement('script');
        script.id = scriptId;
        // Client ID de produção fornecido anteriormente
        script.src = `https://www.paypal.com/sdk/js?client-id=AZ6S85gBFj5k6V8_pUx1R-nUoJqL-3w4l9n5Z6G8y7o9W7a2Jm-B0E3uV6KsoJAg4fImv_iJqB1t4p_Q&components=buttons&currency=${currencyCode}`;
        
        script.onload = () => {
            // Verifica se o objeto paypal existe no window
            if (window.paypal) {
                // Limpa o container antes de renderizar para evitar botões duplicados
                const buttonContainer = document.getElementById('paypal-button-container');
                if (buttonContainer) {
                    buttonContainer.innerHTML = '';
                }

                window.paypal.Buttons({
                    // Função para criar a ordem no PayPal
                    createOrder: function(data: any, actions: any) {
                        return actions.order.create({
                            purchase_units: [{
                                description: "Assinatura Mensal - Italo Santos",
                                amount: {
                                    value: amount, // Usa o valor dinâmico
                                    currency_code: currencyCode, // Usa a moeda dinâmica
                                }
                            }]
                        });
                    },
                    // Função para ser chamada após o usuário aprovar o pagamento
                    onApprove: function(data: any, actions:any) {
                         if (actions.order) {
                            return actions.order.capture().then(function(details: any) {
                                // Chama a função de sucesso que foi passada como prop
                                onPaymentSuccess();
                            });
                        } else {
                            // Fallback caso 'actions.order' não esteja disponível
                            onPaymentSuccess();
                            return Promise.resolve();
                        }
                    },
                    onError: function (err: any) {
                        // Log de erro para depuração
                        console.error('Erro no checkout do PayPal:', err);
                    }
                }).render('#paypal-button-container');
            }
        };

        document.body.appendChild(script);

        return () => {
            // Limpeza ao desmontar o componente
            const buttonContainer = document.getElementById('paypal-button-container');
            if(buttonContainer) {
                buttonContainer.innerHTML = '';
            }
        };

    }, [amount, currencyCode, onPaymentSuccess]);

    return (
        <div id="paypal-button-container" className="w-full max-w-xs mx-auto min-h-[50px]">
           {/* O botão do PayPal será renderizado aqui pelo script */}
        </div>
    );
}

export default PayPalHostedButton;
