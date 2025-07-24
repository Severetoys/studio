
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import Image from 'next/image';

interface MercadoPagoButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  disabled?: boolean;
  customerInfo?: { name: string, email: string };
  isQuickPay?: boolean;
  label?: string;
  isBrazil?: boolean;
}

declare global {
    interface Window {
        MercadoPago: any;
    }
}

export default function MercadoPagoButton({ amount, onSuccess, disabled = false, customerInfo, isQuickPay = false, label, isBrazil }: MercadoPagoButtonProps) {
  const { toast } = useToast();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const paymentBrickContainer = useRef<HTMLDivElement>(null);
  const cardPaymentBrickContainer = useRef<HTMLDivElement>(null);
  const brickInstance = useRef<any>(null);
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

  // Static data for the Pix modal
  const pixQrCodeImage = "https://placehold.co/256x256.png?text=QR+Code";
  const pixCopyPasteCode = "00020126360014br.gov.bcb.pix0114+55119999999995204000053039865802BR5913Italo_Santos6009SAO_PAULO62070503***6304E4A5";

  useEffect(() => {
    if (window.MercadoPago) {
      setIsSdkReady(true);
    }
  }, []);

  const handlePaymentSuccess = async (details: any, isQuickPayFlow: boolean) => {
    setIsModalOpen(false);
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
          walletConnect: "all",
        };
        if (isBrazil) {
           paymentMethodsConfig.googlePay = 'all';
           paymentMethodsConfig.applePay = 'all';
        }

        const brick = await mp.bricks().create("cardPayment", containerId, {
            initialization: {
                amount: amount,
                payer: customerInfo?.email ? { 
                  firstName: customerInfo.name.split(' ')[0],
                  lastName: customerInfo.name.split(' ').slice(1).join(' '),
                  email: customerInfo.email,
                } : undefined,
            },
            customization: {
                visual: { style: { theme: 'dark', customVariables: { baseColor: 'hsl(var(--primary))' } } },
                paymentMethods: paymentMethodsConfig,
            },
            callbacks: {
                onReady: () => setIsProcessing(false),
                onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
                  // Mocking the success response for the prototype
                  const paymentData = { id: `mock_${Date.now()}`, status: 'approved', payer: {
                      first_name: customerInfo?.name?.split(' ')[0] || formData.payer?.firstName || 'Cliente',
                      last_name: customerInfo?.name?.split(' ').slice(1).join(' ') || formData.payer?.lastName || '',
                      email: customerInfo?.email || formData.payer?.email || 'email@exemplo.com'
                  }};
                  return handlePaymentSuccess(paymentData, isQuickPay || false);
                },
                onError: (error: any) => {
                  setIsProcessing(false);
                  toast({ variant: 'destructive', title: 'Erro no pagamento', description: error.message || "Por favor, tente novamente." });
                },
            },
        });
        brickInstance.current = brick;
      } catch (e) {
        console.error("Erro ao renderizar o Card Payment Brick: ", e);
        toast({ variant: 'destructive', title: 'Erro ao iniciar pagamento' })
        setIsProcessing(false);
      }
  };
  
  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCopyPasteCode);
    toast({ title: "Código Pix copiado!" });
  };
  
  const handleOpenModal = () => {
      setIsModalOpen(true);
  };
  
  const handleButtonClick = () => {
    if (label?.toLowerCase() === 'pix') {
      handleOpenModal();
    } else {
      // For Google/Apple, we can also use a modal to host the brick
      handleOpenModal();
    }
  };

  useEffect(() => {
    if (isModalOpen && label?.toLowerCase() !== 'pix') {
        setTimeout(() => createPaymentBrick('card-payment-brick-container'), 100);
    }
    return () => {
      if (brickInstance.current) {
        brickInstance.current.unmount().catch((e:any) => console.log("error unmounting", e));
        brickInstance.current = null;
      }
    };
  }, [isModalOpen, label]);

  if (isQuickPay) {
      return (
        <>
            <Button 
                className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold border-2 border-neutral-700 hover:border-neutral-500 transition-all duration-300 flex items-center justify-center flex-1 px-2"
                onClick={handleButtonClick}
                disabled={disabled || isProcessing}
            >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="truncate">{label}</span>}
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-card border-primary/50 text-card-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-primary text-shadow-neon-red-light">
                           {label === 'Pix' ? 'Pagar com Pix' : 'Finalizar Pagamento'}
                        </DialogTitle>
                         <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Fechar</span>
                        </DialogClose>
                    </DialogHeader>
                    {label === 'Pix' ? (
                       <div className="flex flex-col items-center gap-4 py-4">
                           <Image src={pixQrCodeImage} alt="QR Code Pix" width={256} height={256} data-ai-hint="QR code" />
                           <DialogDescription>Aponte a câmera do seu celular para pagar.</DialogDescription>
                           <Separator />
                           <p className="text-sm text-muted-foreground">Ou copie o código abaixo:</p>
                           <div className="w-full bg-muted p-3 rounded-md text-xs break-all text-muted-foreground">
                            {pixCopyPasteCode}
                           </div>
                           <Button onClick={handleCopyPixCode} className="w-full">
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Código
                           </Button>
                       </div>
                    ) : (
                       <div id="card-payment-brick-container" className="min-h-[450px]">
                            {isProcessing && (
                                 <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 rounded-lg">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">Carregando...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
      )
  }

  // --- Logic for the embedded payment brick on the checkout page (not quick pay) ---
  useEffect(() => {
    if (!isQuickPay && paymentBrickContainer.current) {
        createPaymentBrick('paymentBrick_container');
    }
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
