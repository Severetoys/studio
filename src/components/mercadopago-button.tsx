
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface MercadoPagoButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  disabled?: boolean;
  customerInfo?: { name: string; email: string };
  isQuickPay?: boolean;
  label?: string;
  isBrazil?: boolean;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

const PayPalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M7.74 2.42.36 17.58a.5.5 0 0 0 .6.56l5.77-1.46a.5.5 0 0 1 .58.58l-1.46 5.77a.5.5 0 0 0 .56.6l15.16-7.38a.5.5 0 0 0 .19-1.04l-5.77-1.46a.5.5 0 0 1-.58-.58l1.46-5.77a.5.5 0 0 0-.56-.6L8.78 2.23a.5.5 0 0 0-1.04.19z"></path>
    </svg>
);


export default function MercadoPagoButton({ amount, onSuccess, disabled = false, customerInfo, isQuickPay = false, label, isBrazil }: MercadoPagoButtonProps) {
  const { toast } = useToast();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentBrickContainerId = `paymentBrick_container_${label?.replace(/\s+/g, '') || 'default'}`;
  const brickInstance = useRef<any>(null);
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (brickInstance.current) {
        brickInstance.current.unmount();
      }
    };
  }, []);

  const handlePaymentSuccess = async (details: any) => {
    setIsProcessing(false);
    toast({
      title: "Pagamento bem-sucedido!",
      description: `O pagamento ${details.id || 'mock_id'} foi concluído.`,
    });
    
    try {
      await fetch('/api/payment-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: details.id || `mock_${Date.now()}`,
          payer: {
            name: customerInfo?.name || `${details.payer?.first_name || ''} ${details.payer?.last_name || ''}`.trim(),
            email: customerInfo?.email || details.payer?.email,
          }
        }),
      });
    } catch (e) {
      console.error("Falha ao chamar o webhook interno", e);
    }
    onSuccess(details);
  };
  
  const renderPaymentBrick = async (containerId: string) => {
      const container = document.getElementById(containerId);
      if (!container || !isSdkReady || !publicKey || disabled || amount <= 0) return;
  
      if (brickInstance.current) {
          await brickInstance.current.unmount();
          brickInstance.current = null;
      }
      
      const mp = new window.MercadoPago(publicKey, { locale: isBrazil ? 'pt-BR' : 'en-US' });
      setIsProcessing(true);
      
      try {
        const paymentMethodsConfig: any = {
          creditCard: "all",
          debitCard: "all",
          pix: "all"
        };
        
        const settings = {
            initialization: {
                amount: amount,
                payer: customerInfo?.email ? { 
                  firstName: customerInfo.name.split(' ')[0],
                  lastName: customerInfo.name.split(' ').slice(1).join(' ') || customerInfo.name.split(' ')[0],
                  email: customerInfo.email,
                } : undefined,
            },
            customization: {
                paymentMethods: paymentMethodsConfig,
            },
            callbacks: {
                onReady: () => setIsProcessing(false),
                onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
                   // Para um protótipo, simulamos a resposta e redirecionamos.
                   // Numa aplicação real, o backend criaria uma preferência de pagamento
                   // e redirecionaria para a URL do Mercado Pago.
                   console.log("Submitting payment...", { selectedPaymentMethod, formData });
                   const paymentData = { 
                     id: `mock_${Date.now()}`, 
                     status: 'approved', 
                     payer: {
                       first_name: customerInfo?.name?.split(' ')[0] || formData.payer?.firstName || 'Cliente',
                       last_name: customerInfo?.name?.split(' ').slice(1).join(' ') || formData.payer?.lastName || '',
                       email: customerInfo?.email || formData.payer?.email || 'email@exemplo.com'
                     }
                   };
                   handlePaymentSuccess(paymentData);
                },
                onError: (error: any) => {
                  setIsProcessing(false);
                  toast({ variant: 'destructive', title: 'Erro no pagamento', description: error.message || "Por favor, tente novamente." });
                },
            },
        };

        const bricksBuilder = mp.bricks();
        brickInstance.current = await bricksBuilder.create("payment", containerId, settings);

      } catch (e) {
        console.error("Erro ao renderizar o Payment Brick: ", e);
        toast({ variant: 'destructive', title: 'Erro ao iniciar pagamento' })
        setIsProcessing(false);
      }
  };
  
  const handleQuickPayClick = () => {
    if (disabled || isProcessing || amount <= 0) return;

    setIsProcessing(true);
    toast({ title: "Preparando pagamento..." });

    // Em um cenário real, você faria uma chamada ao seu backend para criar uma preferência de pagamento no Mercado Pago.
    // O backend retornaria uma `init_point` (URL de checkout).
    // Para este protótipo, vamos simular isso redirecionando para uma URL de exemplo e chamando o webhook de sucesso.
    console.log("Simulando criação de preferência de pagamento para:", { amount, customerInfo });

    // Simula o redirecionamento e sucesso após um tempo.
    setTimeout(() => {
        handlePaymentSuccess({
            id: `mock_quickpay_${Date.now()}`,
            payer: customerInfo
        });
        // Aqui você faria: window.location.href = 'URL_DO_MERCADO_PAGO';
        // Como não temos backend, chamamos o sucesso diretamente.
    }, 2000);
  };


  useEffect(() => {
    if (!isQuickPay && isSdkReady && document.getElementById(paymentBrickContainerId)) {
        renderPaymentBrick(paymentBrickContainerId);
    }
  }, [isSdkReady, amount, disabled, customerInfo?.email, customerInfo?.name, publicKey, isBrazil, isQuickPay]);

  if (isQuickPay) {
      return (
        <Button 
            className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold border-2 border-neutral-700 hover:border-neutral-500 transition-all duration-300 flex items-center justify-center flex-1 px-2"
            onClick={handleQuickPayClick}
            disabled={disabled || isProcessing}
        >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : (label === 'PayPal' ? <PayPalIcon /> : <span className="truncate">{label}</span>)}
        </Button>
      )
  }

  if (!isSdkReady || !publicKey) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2">Carregando pagamentos...</p>
      </div>
    );
  }
  
  return (
    <div className={cn("relative w-full min-h-[400px]")}>
      <div id={paymentBrickContainerId}></div>
       { (disabled || amount <= 0) &&
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg">
              <p className="text-muted-foreground text-sm font-semibold text-center p-4">
                  {amount <= 0 ? "Adicione itens ao carrinho para pagar" : "Preencha seu nome e email para continuar"}
              </p>
          </div>
       }
        {isProcessing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Processando...</span>
                </div>
            </div>
        )}
    </div>
  );
}
