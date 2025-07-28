
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, ClipboardCopy } from "lucide-react";
import Image from "next/image";
import { createPixPayment } from '@/ai/flows/mercado-pago-pix-flow';
import { Alert, AlertTitle, AlertDescription as AlertDesc } from '@/components/ui/alert';

interface PixPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  amount: number;
  onPaymentSuccess: () => void;
}

export default function PixPaymentModal({ isOpen, onOpenChange, amount, onPaymentSuccess }: PixPaymentModalProps) {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pixData, setPixData] = useState<{ qrCodeBase64: string; qrCode: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePix = async () => {
        if (!email) {
            toast({ variant: 'destructive', title: 'Email é obrigatório' });
            return;
        }
        setIsLoading(true);
        setError(null);
        setPixData(null);

        try {
            const result = await createPixPayment({ amount, email });
            if (result.error) {
                throw new Error(result.error);
            }
            if (result.qrCodeBase64 && result.qrCode) {
                setPixData({ qrCodeBase64: result.qrCodeBase64, qrCode: result.qrCode });
                localStorage.setItem('customerEmail', email);
                // In a real scenario, you would poll a webhook to confirm payment.
                // For this simulation, we'll have a button to confirm.
            } else {
                 throw new Error("Não foi possível obter os dados do PIX.");
            }
        } catch (e: any) {
            setError(e.message || 'Ocorreu um erro desconhecido.');
            toast({ variant: 'destructive', title: 'Erro ao gerar PIX', description: e.message });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Código PIX copiado!" });
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after a short delay to allow closing animation
        setTimeout(() => {
            setEmail('');
            setPixData(null);
            setError(null);
            setIsLoading(false);
        }, 300);
    }
    
    // This is a simulation since we can't get a real payment webhook.
    const handleManualConfirmation = () => {
        toast({
            title: "Pagamento confirmado!",
            description: "Acesso liberado. Redirecionando...",
        });
        onPaymentSuccess();
        handleClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-primary text-shadow-neon-red-light text-center flex items-center justify-center gap-2">
                        <QrCode /> Pagamento via PIX
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {pixData ? `Escaneie o QR Code ou use o código para pagar R$ ${amount.toFixed(2)}.` : 'Insira seu e-mail para gerar o código PIX.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDesc>{error}</AlertDesc>
                        </Alert>
                    )}

                    {!pixData ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu.email@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button onClick={handleGeneratePix} disabled={isLoading || !email} className="w-full h-11">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'Gerando...' : 'Gerar QR Code PIX'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 flex flex-col items-center">
                             <div className="p-2 bg-white rounded-lg">
                                <Image
                                    src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`}
                                    alt="PIX QR Code"
                                    width={256}
                                    height={256}
                                />
                            </div>
                            <div className="w-full space-y-2">
                                <Label>PIX Copia e Cola</Label>
                                <div className="flex items-center gap-2">
                                     <Input
                                        readOnly
                                        value={pixData.qrCode}
                                        className="text-xs font-mono"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(pixData.qrCode)}>
                                        <ClipboardCopy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                             <p className="text-xs text-muted-foreground text-center">Após o pagamento, clique no botão abaixo para confirmar e liberar seu acesso.</p>
                            <Button onClick={handleManualConfirmation} className="w-full bg-green-600 hover:bg-green-700 h-11">
                                Já Paguei, Liberar Acesso
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

