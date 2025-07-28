
"use client";

import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import PixPaymentModal from './pix-payment-modal';
import { Button } from './ui/button';

interface PaymentButtonsProps {
    onPaymentSuccess: () => void;
    amount: number;
    currency: string;
}

export default function PaymentButtons({ onPaymentSuccess, amount, currency }: PaymentButtonsProps) {
    const { toast } = useToast();
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    
    // ATENÇÃO: Esta é uma chave pública de teste. Em produção, use sua chave real.
    const mercadoPagoPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-c138ea23-a111-4731-893c-6333a4d7d13a';
    
    useEffect(() => {
        initMercadoPago(mercadoPagoPublicKey, { locale: 'pt-BR' });
    }, [mercadoPagoPublicKey]);
    
    useEffect(() => {
        // No mundo real, esta chamada seria para o seu backend.
        // O backend criaria uma preferência de pagamento no Mercado Pago e retornaria o ID.
        // Para este exemplo, usaremos um ID de preferência de teste pré-gerado.
        const testPreferenceId = "209749133-e08508e9-d7de-4f51-a20c-3687796d860d";
        setPreferenceId(testPreferenceId);
    }, [amount, currency, toast]);

    const handlePixClick = () => {
        if (currency !== 'BRL') {
            toast({
                variant: 'destructive',
                title: 'PIX Indisponível',
                description: 'O pagamento com PIX só está disponível para transações em BRL.',
            });
            return;
        }
        setIsPixModalOpen(true);
    };

    if (!preferenceId) {
        return <div className="h-[72px] flex items-center justify-center"><p className="text-sm text-muted-foreground">Carregando pagamentos...</p></div>;
    }

    return (
        <div className="flex justify-around items-center w-full max-w-sm mt-2">
             <div className="flex-1 flex justify-center">
                <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58%20(1).jpeg?alt=media&token=00683b6b-59ac-483c-93f4-6c879ab9b86c"
                    alt="Google Pay" 
                    width={100} 
                    height={40} 
                    className="object-contain"
                />
            </div>
            
            <div className="flex-shrink-0 mx-2 flex flex-col items-center">
                <button 
                    className="transition-transform hover:scale-105" 
                    onClick={handlePixClick}
                    aria-label="Pagar com PIX"
                >
                    <Image 
                        src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649" 
                        alt="PIX" 
                        width={28} 
                        height={28} 
                        className="object-contain"
                    />
                </button>
            </div>

            <div className="flex-1 flex justify-center">
                 <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=3a91ba87-6df8-41db-a3bd-64f720e7feb2"
                    alt="Apple Pay" 
                    width={100} 
                    height={40} 
                    className="object-contain"
                />
            </div>

            <PixPaymentModal
                isOpen={isPixModalOpen}
                onOpenChange={setIsPixModalOpen}
                amount={amount}
                onPaymentSuccess={onPaymentSuccess}
            />
        </div>
    );
}
