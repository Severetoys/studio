
"use client";

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface PaypalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  disabled?: boolean;
}

declare global {
    interface Window {
        paypal: any;
    }
}

const PayPalIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.74,2.42,7.36,5.1a.21.21,0,0,0,.2.23l2.88-.1a.21.21,0,0,1,.21.23L9.6,13.75a.21.21,0,0,0,.21.22l2.37-.08a.21.21,0,0,1,.21.23L11.23,21.8a.22.22,0,0,0,.21.21h2.82a.22.22,0,0,0,.22-.2l2-13.43a.22.22,0,0,0-.21-.24l-3.23.11a.22.22,0,0,1-.21-.24L12.7,2.42a.21.21,0,0,0-.21-.21H8a.21.21,0,0,0-.24.21Z" fill="#253b80"></path>
      <path d="M10.87,14.57,11.82.93A.21.21,0,0,0,11.61.71H8.69a.21.21,0,0,0-.21.2L7.36,7.59a.22.22,0,0,0,.21.24l2.58-.09a.21.21,0,0,1,.21.23l-.93,6.3a.21.21,0,0,0,.21.22l2.74-.09a.21.21,0,0,0,.2-.23Z" fill="#179bd7"></path>
    </svg>
);


export default function PaypalButton({ amount, onSuccess, disabled = false }: PaypalButtonProps) {
  const { toast } = useToast();
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalButtonContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (window.paypal) {
      setIsSdkReady(true);
    } else {
        const script = document.querySelector(`script[src*="paypal.com/sdk/js"]`) as HTMLScriptElement | null;
        if(script){
            script.addEventListener('load', () => setIsSdkReady(true));
        }
    }
  }, []);

  useEffect(() => {
    if (isSdkReady && paypalButtonContainerRef.current && !disabled && amount > 0) {
      setIsProcessing(true);
      
      // Limpa qualquer botão existente antes de renderizar um novo
      while (paypalButtonContainerRef.current.firstChild) {
        paypalButtonContainerRef.current.removeChild(paypalButtonContainerRef.current.firstChild);
      }

      try {
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2),
                  currency_code: 'BRL'
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            return actions.order.capture().then((details: any) => {
              onSuccess(details);
            });
          },
          onError: (err: any) => {
            console.error("Erro no PayPal:", err);
            toast({ variant: 'destructive', title: 'Erro no pagamento', description: "Ocorreu um erro com o PayPal. Por favor, tente novamente." });
          },
          onInit: () => {
             setIsProcessing(false);
          }
        }).render(paypalButtonContainerRef.current);
      } catch (error) {
         console.error("Falha ao renderizar botões do PayPal:", error);
         setIsProcessing(false);
      }
    }
  }, [isSdkReady, amount, disabled, onSuccess, toast]);


  if (!isSdkReady) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2">Carregando PayPal...</p>
      </div>
    );
  }
  
  return (
    <div className={cn("relative w-full min-h-[50px] mt-4")}>
      <div ref={paypalButtonContainerRef}></div>
      {(disabled || amount <= 0 || isProcessing) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-lg">
              <p className="text-muted-foreground text-sm font-semibold text-center p-4">
                  { isProcessing ? <Loader2 className="h-6 w-6 animate-spin"/> : (amount <= 0 ? "Adicione itens ao carrinho" : "Preencha seus dados para continuar")}
              </p>
          </div>
      )}
    </div>
  );
}
