
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle, Loader2, KeyRound, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';
import AuthModal from '@/components/auth-modal';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPixPayment, type CreatePixPaymentOutput } from '@/ai/flows/mercado-pago-pix-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getPayPalClientId, createPayPalOrder, capturePayPalOrder } from "@/ai/flows/paypal-payment-flow";
import { savePaymentDetails } from '@/services/user-auth-service';


const features = [
    "Conteúdo exclusivo e sem censura.",
    "Acesso a vídeos e ensaios completos.",
    "Atualizações semanais com novas produções.",
    "Comunidade e interação direta.",
];

const FeatureList = () => (
    <div className="relative w-full overflow-hidden bg-background py-4">
        <div className="flex animate-marquee whitespace-nowrap">
            {features.map((feature, index) => (
                <span key={index} className="flex items-center mx-4 text-muted-foreground text-lg">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
            {features.map((feature, index) => (
                 <span key={`dup-${index}`} className="flex items-center mx-4 text-muted-foreground text-lg" aria-hidden="true">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
        </div>
    </div>
);


const PayPalWrapper = ({ priceInfo, customerInfo, onPaymentSuccess }: { priceInfo: any, customerInfo: {name: string, email: string}, onPaymentSuccess: (details: any) => void }) => {
    const { toast } = useToast();
    const [clientId, setClientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClientId = async () => {
            setIsLoading(true);
            try {
                const id = await getPayPalClientId();
                if (!id) throw new Error("Client ID do PayPal não foi recebido do servidor.");
                setClientId(id);
            } catch (error: any) {
                console.error("Erro ao buscar Client ID do PayPal:", error);
                toast({
                    variant: "destructive",
                    title: "Erro de Configuração do PayPal",
                    description: error.message || "Não foi possível carregar as credenciais de pagamento.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchClientId();
    }, [toast]);

    if (isLoading) {
        return (
             <div className="h-20 flex justify-center items-center bg-gray-800 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        );
    }

    if (!clientId) {
        return (
             <div className="h-20 flex justify-center items-center bg-gray-800 rounded-md">
                <p className="text-xs text-white">Chave do cliente PayPal não encontrada.</p>
            </div>
        );
    }
    
    // O botão do Google Pay via PayPal funciona melhor com moedas suportadas globalmente.
    // Vamos renderizar o botão padrão do PayPal para BRL.
    if (priceInfo.currencyCode !== 'BRL') {
        return null;
    }

    return (
        <PayPalScriptProvider options={{ clientId: