
"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { createPayPalOrder, capturePayPalOrder } from "@/ai/flows/paypal-payment-flow";

interface PayPalButtonsWrapperProps {
    amount: number;
    currencyCode: string;
    onPaymentSuccess: () => void;
}

const PayPalButtonsWrapper = ({ amount, currencyCode, onPaymentSuccess }: PayPalButtonsWrapperProps) => {
    const { toast } = useToast();
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
        return <p className="text-destructive text-sm">Chave do cliente PayPal não encontrada.</p>;
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
