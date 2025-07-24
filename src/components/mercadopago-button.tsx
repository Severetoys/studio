
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

const PayPalIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.74,2.42,7.36,5.1a.21.21,0,0,0,.2.23l2.88-.1a.21.21,0,0,1,.21.23L9.6,13.75a.21.21,0,0,0,.21.22l2.37-.08a.21.21,0,0,1,.21.23L11.23,21.8a.22.22,0,0,0,.21.21h2.82a.22.22,0,0,0,.22-.2l2-13.43a.22.22,0,0,0-.21-.24l-3.23.11a.22.22,0,0,1-.21-.24L12.7,2.42a.21.21,0,0,0-.21-.21H8a.21.21,0,0,0-.24.21Z" fill="#253b80"></path>
      <path d="M10.87,14.57,11.82.93A.21.21,0,0,0,11.61.71H8.69a.21.21,0,0,0-.21.2L7.36,7.59a.22.22,0,0,0,.21.24l2.58-.09a.21.21,0,0,1,.21.23l-.93,6.3a.21.21,0,0,0,.21.22l2.74-.09a.21.21,0,0,0,.2-.23Z" fill="#179bd7"></path>
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
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              label === 'PayPal' ? <PayPalIcon className="h-5 w-5" /> : <span className="truncate">{label}</span>
            )}
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
