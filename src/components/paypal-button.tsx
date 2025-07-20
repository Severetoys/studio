
"use client";

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any) => void;
  disabled: boolean;
}

declare global {
    interface Window {
        paypal?: any;
    }
}

export default function PayPalButton({ amount, onSuccess, disabled }: PayPalButtonProps) {
  const { toast } = useToast();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (window.paypal) {
      setIsSdkReady(true);
    }
  }, []);

  const createOrder = (data: any, actions: any) => {
    setIsProcessing(true);
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
            currency_code: 'BRL',
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
    }).catch((err: any) => {
      console.error("Erro ao criar pedido PayPal:", err);
      toast({
        variant: "destructive",
        title: "Erro no PayPal",
        description: "Não foi possível iniciar o pagamento. Tente novamente.",
      });
      setIsProcessing(false);
      throw err;
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      onSuccess(details);
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
  };

  const onError = (err: any) => {
    console.error("Erro no botão do PayPal:", err);
    toast({
        variant: "destructive",
        title: "Erro no PayPal",
        description: "Ocorreu um erro inesperado. O usuário pode ter cancelado o pagamento ou houve uma falha na configuração.",
    });
    setIsProcessing(false);
  };

  if (!isSdkReady) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const PayPalButtonsComponent = window.paypal.Buttons.driver("react", { React, ReactDOM: null });

  return (
    <div className="relative">
      {(disabled || isProcessing) && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 cursor-not-allowed">
          {isProcessing && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
      )}
      <PayPalButtonsComponent
        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
        forceReRender={[amount]}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={disabled}
      />
    </div>
  );
}
