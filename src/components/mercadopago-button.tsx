
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
            name: isQuickPayFlow ? `${details.payer.first_name} ${details.payer.last_name}`.trim() : customerInfo?.name,
            email: isQuickPayFlow ? details.payer.email : customerInfo?.email,
          }
        }),
      });
    } catch (e) {
      console.error("Falha ao chamar o webhook interno", e);
    }

    if(isQuickPayFlow) {
        onSuccess(details); // For quick pay, let the parent handle redirect
    } else {
        onSuccess(details);
    }
  };

  useEffect(() => {
    // Destrói a instância anterior do brick se ela existir
    if (paymentBrickContainer.current?.innerHTML) {
      paymentBrickContainer.current.innerHTML = '';
    }

    if (isSdkReady && paymentBrickContainer.current && publicKey && !disabled && amount > 0) {
      const mp = new window.MercadoPago(publicKey);
      
      const renderPaymentBrick = async () => {
        setIsProcessing(true);
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
                  pix: "all",
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
                  // Simula a resposta do pagamento para um ambiente de desenvolvimento/teste
                  // Em produção, aqui seria feita uma chamada para um backend que processaria o pagamento.
                  const paymentData = {
                    id: `mock_${Date.now()}`, 
                    status: 'approved',
                    payer: {
                        first_name: customerInfo?.name.split(' ')[0] || formData.payer.firstName || 'Cliente',
                        last_name: customerInfo?.name.split(' ').slice(1).join(' ') || formData.payer.lastName || '',
                        email: customerInfo?.email || formData.payer.email || 'email@exemplo.com'
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
        } catch (e) {
            console.error("Erro ao renderizar o Payment Brick: ", e);
            toast({ variant: 'destructive', title: 'Erro ao iniciar pagamento', description: 'Tente recarregar a página.'})
            setIsProcessing(false);
        }
      };
      
      renderPaymentBrick();
    }
  // Adicionamos 'customerInfo.email' e 'customerInfo.name' como dependências para recriar o brick quando o usuário alterar os dados
  }, [isSdkReady, amount, disabled, customerInfo?.email, customerInfo?.name, publicKey, isQuickPay]);

  if (!isSdkReady || !publicKey) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2">Carregando pagamentos...</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", isQuickPay ? 'min-h-[50px]' : 'min-h-[400px]')}>
      <div id="paymentBrick_container" ref={paymentBrickContainer}></div>
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
