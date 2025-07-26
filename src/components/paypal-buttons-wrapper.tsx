
"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { createPayPalOrder, capturePayPalOrder, getPayPalClientId } from "@/ai/flows/paypal-payment-flow";
import { Loader2 } from "lucide-react";

interface PayPalButtonsWrapperProps {
    amount: number;
    currencyCode: string;
    onPaymentSuccess: () => void;
}

const PayPalButtonsWrapper = ({ amount, currencyCode, onPaymentSuccess }: PayPalButtonsWrapperProps) => {
    const { toast } = useToast();
    const [clientId, setClientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const id = await getPayPalClientId();
                setClientId(id);
            } catch (error) {
                console.error("Failed to fetch PayPal Client ID", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro de Configuração',
                    description: 'Não foi possível carregar a configuração de pagamento.',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchClientId();
    }, [toast]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (!clientId) {
        return <p className="text-destructive text-sm p-4">Chave do cliente PayPal não encontrada.</p>;
    }
    
    return (
        <PayPalScriptProvider options={{ 
            "clientId": clientId, 
            currency: currencyCode,
            components: "buttons,googlepay" // Carrega o componente do Google Pay
        }}>
            <PayPalButtons
                 style={{
                    layout: "vertical",
                    color: "black",
                    shape: "rect",
                    label: "pay"
                }}
                fundingSource="googlepay" // Especifica que este botão é para o Google Pay
                createOrder={async (data, actions) => {
                    try {
                        const response = await createPayPalOrder({ amount, currencyCode });
                        if (response.orderID) {
                            return response.orderID;
                        } else {
                            throw new Error(response.error || "Falha ao criar ordem no PayPal.");
                        }
                    } catch (error: any) {
                        toast({ variant: 'destructive', title: 'Erro ao Criar Pedido', description: error.message });
                        return Promise.reject(error);
                    }
                }}
                onApprove={async (data, actions) => {
                    try {
                        const response = await capturePayPalOrder({ orderID: data.orderID });
                        if (response.success) {
                            toast({ title: "Pagamento Aprovado!", description: `Transação ${response.details.id} concluída.` });
                            onPaymentSuccess();
                        } else {
                            throw new Error(response.error || "Falha ao capturar o pagamento.");
                        }
                    } catch (error: any) {
                        toast({ variant: 'destructive', title: 'Erro na Aprovação', description: error.message });
                        return Promise.reject(error);
                    }
                }}
                 onCancel={() => {
                    toast({ title: 'Pagamento Cancelado', description: 'Você cancelou a transação.' });
                }}
                onError={(err: any) => {
                    toast({ variant: 'destructive', title: 'Erro no Pagamento', description: err.toString() });
                    console.error("Erro no PayPal Button:", err);
                }}
            />
        </PayPalScriptProvider>
    );
};

export default PayPalButtonsWrapper;
