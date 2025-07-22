
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any) => void;
  disabled?: boolean;
  customerInfo?: { name: string, email: string };
  isQuickPay?: boolean;
}

declare global {
    interface Window {
        paypal?: any;
        ReactDOM?: any;
    }
}

export default function PayPalButton({ amount, onSuccess, disabled = false, customerInfo, isQuickPay = false }: PayPalButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.paypal) {
      setIsSdkReady(true);
    }
  }, []);

  const handleQuickPaySuccess = async (details: any) => {
    toast({
      title: "Pagamento bem-sucedido!",
      description: `O pagamento ${details.id} foi concluído.`,
    });
    
    try {
        await fetch('/api/payment-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentId: details.id,
                payer: {
                  name: details.payer.name.given_name + ' ' + details.payer.name.surname,
                  email: details.payer.email_address,
                }
            }),
        });
    } catch (e) {
        console.error("Falha ao chamar o webhook interno", e);
    }
    router.push('/auth');
  };

  useEffect(() => {
    if (isSdkReady && paypalButtonContainerRef.current && paypalButtonContainerRef.current.childElementCount === 0) {
      
      const finalDisabledState = disabled || isProcessing || parseFloat(amount) <= 0;

      if (finalDisabledState) {
        return;
      }
      
      const buttons = window.paypal.Buttons({
        style: { 
          layout: 'vertical', 
          color: 'blue', 
          shape: 'rect', 
          label: 'pay', 
          tagline: false 
        },
        createOrder: (_: any, actions: any) => {
          setIsProcessing(true);
          const payerInfo = customerInfo?.email ? {
            payer: {
              email_address: customerInfo.email,
              name: {
                given_name: customerInfo.name.split(' ')[0],
                surname: customerInfo.name.split(' ').slice(1).join(' ') || customerInfo.name.split(' ')[0],
              }
            }
          } : {};

          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount,
                currency_code: 'BRL',
              },
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
            },
            ...payerInfo
          }).catch((err: any) => {
            console.error("Erro ao criar pedido PayPal:", err);
            toast({
              variant: "destructive",
              title: "Erro no PayPal",
              description: "Não foi possível iniciar o pagamento.",
            });
            setIsProcessing(false);
            throw err;
          });
        },
        onApprove: (_: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            if (isQuickPay) {
                handleQuickPaySuccess(details);
            } else {
                onSuccess(details);
            }
            setIsProcessing(false);
          }).catch((err: any) => {
            console.error("Erro ao capturar pagamento PayPal:", err);
            toast({
              variant: "destructive",
              title: "Erro no Pagamento",
              description: "Houve um problema ao processar seu pagamento.",
            });
            setIsProcessing(false);
            throw err;
          });
        },
        onError: (err: any) => {
          console.error("Erro no botão do PayPal:", err);
          toast({
            variant: "destructive",
            title: "Erro no PayPal",
            description: "Ocorreu um erro inesperado ou o pagamento foi cancelado.",
          });
          setIsProcessing(false);
        },
        onCancel: () => {
          setIsProcessing(false);
          toast({
            title: 'Pagamento Cancelado',
            description: 'Você cancelou o processo de pagamento.',
          });
        }
      });
      
      buttons.render(paypalButtonContainerRef.current).catch((err: any) => {
        console.error("Failed to render paypal buttons", err);
      });
    }
  }, [isSdkReady, amount, disabled, customerInfo, isQuickPay, onSuccess, toast, router]);

  const finalDisabledState = disabled || isProcessing || parseFloat(amount) <= 0;

  if (!isSdkReady) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[100px]", finalDisabledState && "opacity-50 cursor-not-allowed")}>
       {isProcessing && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={paypalButtonContainerRef} className={cn(isProcessing ? 'blur-sm' : '')} />
    </div>
  );
}
