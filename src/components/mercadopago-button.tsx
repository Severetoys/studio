
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
  isBrazil?: boolean;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

// THIS COMPONENT IS NO LONGER IN USE FOR THE MAIN FLOW,
// BUT IS KEPT FOR POTENTIAL FUTURE USE WITH OTHER PAYMENT METHODS.
// THE PIX FLOW IS NOW HANDLED BY A DEDICATED MODAL ON THE HOMEPAGE.

export default function MercadoPagoButton({ amount, onSuccess, disabled = false, customerInfo, isBrazil }: MercadoPagoButtonProps) {
  const { toast } = useToast();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentBrickContainerId = `paymentBrick_container_mercado_pago`;
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
          // Pix is handled by a separate flow now
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

  useEffect(() => {
    if (isSdkReady && document.getElementById(paymentBrickContainerId)) {
        renderPaymentBrick(paymentBrickContainerId);
    }
  }, [isSdkReady, amount, disabled, customerInfo?.email, customerInfo?.name, publicKey, isBrazil]);

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
