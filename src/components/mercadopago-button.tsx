
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface MercadoPagoButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  disabled?: boolean;
  customerInfo?: { name: string, email: string };
  isQuickPay?: boolean;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function MercadoPagoButton({ amount, onSuccess, disabled = false, customerInfo, isQuickPay = false }: MercadoPagoButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentBrickContainer = useRef<HTMLDivElement>(null);
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  useEffect(() => {
    if (window.MercadoPago) {
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
                  name: details.payer.first_name + ' ' + details.payer.last_name,
                  email: details.payer.email,
                }
            }),
        });
    } catch (e) {
        console.error("Falha ao chamar o webhook interno", e);
    }
    router.push('/auth');
  };

  useEffect(() => {
    if (isSdkReady && paymentBrickContainer.current && publicKey && !disabled && amount > 0) {
      // Limpa o container antes de renderizar um novo brick para evitar duplicatas
      paymentBrickContainer.current.innerHTML = '';
      
      const mp = new window.MercadoPago(publicKey);
      
      const renderPaymentBrick = async () => {
        try {
            const bricksBuilder = mp.bricks();
            await bricksBuilder.create("payment", "paymentBrick_container", {
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
                paymentMethods: {
                  creditCard: "all",
                  debitCard: "all",
                  ticket: "all",
                  bankTransfer: "all",
                  mercadoPago: "all",
                  atm: "all",
                },
              },
              callbacks: {
                onReady: () => {
                  setIsProcessing(false);
                },
                onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
                  setIsProcessing(true);
                  try {
                     const paymentData = {
                        id: `mock_${Date.now()}`, 
                        status: 'approved',
                        payer: {
                            first_name: customerInfo?.name.split(' ')[0] || 'Cliente',
                            last_name: customerInfo?.name.split(' ').slice(1).join(' ') || '',
                            email: customerInfo?.email || 'email@exemplo.com'
                        }
                    };
                    if (isQuickPay) {
                        await handleQuickPaySuccess(paymentData);
                    } else {
                        onSuccess(paymentData);
                    }
                  } catch(error) {
                      toast({ variant: 'destructive', title: 'Erro ao processar pagamento.'});
                      console.error(error);
                  } finally {
                    setIsProcessing(false);
                  }
                },
                onError: (error: any) => {
                  setIsProcessing(false);
                  toast({ variant: 'destructive', title: 'Erro no pagamento', description: error.message || "Por favor, tente novamente." });
                  console.error(error);
                },
              },
            });
        } catch (e) {
            console.error("Erro ao renderizar o Payment Brick: ", e);
            setIsProcessing(false);
        }
      };
      
      setIsProcessing(true);
      renderPaymentBrick();

    } else if (paymentBrickContainer.current) {
        // Limpa o brick se as condições não forem atendidas (ex: carrinho vazio)
        paymentBrickContainer.current.innerHTML = '';
    }
  }, [isSdkReady, amount, disabled, customerInfo]);

  if (!isSdkReady || !publicKey) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2">Carregando pagamentos...</p>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[100px]", disabled && "opacity-50 cursor-not-allowed")}>
      <div id="paymentBrick_container" ref={paymentBrickContainer}></div>
       { (disabled || amount <= 0) &&
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg">
              <p className="text-muted-foreground text-sm font-semibold">
                  {amount <= 0 ? "Adicione itens para pagar" : "Preencha seus dados"}
              </p>
          </div>
       }
        {isProcessing && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
    </div>
  );
}
