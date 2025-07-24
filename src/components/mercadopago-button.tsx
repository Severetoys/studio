
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

interface MercadoPagoButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  disabled?: boolean;
  customerInfo?: { name: string, email: string };
  isQuickPay?: boolean;
  label?: string;
  icon?: React.ElementType;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function MercadoPagoButton({ amount, onSuccess, disabled = false, customerInfo, isQuickPay = false, label, icon: Icon }: MercadoPagoButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBrazil, setIsBrazil] = useState(true);
  const paymentBrickContainer = useRef<HTMLDivElement>(null);
  const brickInstance = useRef<any>(null); // Ref to store the brick instance
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    // Detect locale once
    const userLocale = navigator.language || 'pt-BR';
    setIsBrazil(userLocale.toLowerCase().includes('pt'));
    
    if (window.MercadoPago) {
      setIsSdkReady(true);
    }
  }, []);

  const handlePaymentSuccess = async (details: any, isQuickPayFlow: boolean) => {
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
            name: isQuickPayFlow ? `${details.payer?.first_name || ''} ${details.payer?.last_name || ''}`.trim() : customerInfo?.name,
            email: isQuickPayFlow ? details.payer?.email : customerInfo?.email,
          }
        }),
      });
    } catch (e) {
      console.error("Falha ao chamar o webhook interno", e);
    }

    onSuccess(details);
  };
  
  const createPaymentBrick = async (containerId: string) => {
    // Unmount previous instance if it exists
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous content
    while(container.firstChild) {
      container.removeChild(container.firstChild);
    }
    if (brickInstance.current) {
        brickInstance.current.unmount();
        brickInstance.current = null;
    }
    
    if (isSdkReady && publicKey && !disabled && amount > 0) {
      const mp = new window.MercadoPago(publicKey, { locale: isBrazil ? 'pt-BR' : 'en-US' });
      
      setIsProcessing(true);
      try {
        const bricksBuilder = mp.bricks();
        const paymentMethodsConfig: any = {
          creditCard: "all",
          debitCard: "all",
          wallet: "all" // Includes Google Pay & Apple Pay if available
        };

        if (isBrazil) {
          paymentMethodsConfig.pix = "all";
        }
        
        const brick = await bricksBuilder.create("payment", containerId, {
          initialization: {
            amount: amount,
            payer: customerInfo ? {
              firstName: customerInfo.name.split(' ')[0],
              lastName: customerInfo.name.split(' ').slice(1).join(' '),
              email: customerInfo.email,
            } : undefined,
          },
          customization: {
            visual: {
                style: {
                    theme: 'dark',
                    customVariables: {
                        baseColor: 'hsl(var(--primary))'
                    }
                }
            },
            paymentMethods: paymentMethodsConfig,
          },
          callbacks: {
            onReady: () => {
              setIsProcessing(false);
            },
            onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
               // This is a mock payment for demonstration.
               // A real implementation would send this data to a backend to create a real payment.
              const paymentData = {
                id: `mock_${Date.now()}`, 
                status: 'approved',
                payer: {
                    first_name: customerInfo?.name.split(' ')[0] || formData.payer?.firstName || 'Cliente',
                    last_name: customerInfo?.name.split(' ').slice(1).join(' ') || formData.payer?.lastName || '',
                    email: customerInfo?.email || formData.payer?.email || 'email@exemplo.com'
                }
              };
              return handlePaymentSuccess(paymentData, isQuickPay);
            },
            onError: (error: any) => {
              setIsProcessing(false);
              toast({ variant: 'destructive', title: 'Erro no pagamento', description: error.message || "Por favor, tente novamente." });
              console.error(error);
            },
          },
        });
        brickInstance.current = brick; // Store the instance
      } catch (e) {
        console.error("Erro ao renderizar o Payment Brick: ", e);
        toast({ variant: 'destructive', title: 'Erro ao iniciar pagamento', description: 'Tente recarregar a página.'})
        setIsProcessing(false);
      }
    }
  };

  const handleQuickPay = async () => {
    // This now uses the Payment Brick, which is the correct way for SDK v2.
    // It will be rendered in a modal-like element by the SDK.
    const containerId = `paymentBrick_container_modal_${Date.now()}`;
    const dummyContainer = document.createElement('div');
    dummyContainer.id = containerId;
    dummyContainer.className = "checkout-container";
    document.body.appendChild(dummyContainer);

    await createPaymentBrick(containerId);
  };


  if (isQuickPay) {
      return (
        <Button 
            className="w-full h-[72px] bg-neutral-900 hover:bg-neutral-800 text-white text-xl font-semibold border-2 border-neutral-700 hover:border-neutral-500 transition-all duration-300 flex items-center gap-2 flex-1"
            onClick={handleQuickPay}
            disabled={disabled || isProcessing}
        >
            {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                {Icon && <Icon />}
                {label}
              </>
            )}
        </Button>
      )
  }

  // Effect to handle brick creation/re-creation for the main checkout
  useEffect(() => {
    if (!isQuickPay && paymentBrickContainer.current) {
        createPaymentBrick('paymentBrick_container');
    }
    return () => {
      if (brickInstance.current) {
        brickInstance.current.unmount();
      }
    };
  }, [isSdkReady, amount, disabled, customerInfo?.email, customerInfo?.name, publicKey, isBrazil, isQuickPay]);

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
      <div id="paymentBrick_container" ref={paymentBrickContainer}></div>
      <div className="checkout-container"></div>
       { (disabled || amount <= 0) &&
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg">
              <p className="text-muted-foreground text-sm font-semibold text-center p-4">
                  {amount <= 0 ? "Adicione itens ao carrinho para pagar" : "Preencha seu nome e email para continuar"}
              </p>
          </div>
       }
        {isProcessing && !isQuickPay && (
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
