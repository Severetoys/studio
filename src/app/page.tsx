
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle, Loader2, KeyRound, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';
import AuthModal from '@/components/auth-modal';
import { convertCurrency } from '@/ai/flows/currency-conversion-flow';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPixPayment, type CreatePixPaymentOutput } from '@/ai/flows/mercado-pago-pix-flow';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getPayPalClientId, createPayPalOrder, capturePayPalOrder } from "@/ai/flows/paypal-payment-flow";
import { savePaymentDetails } from '@/services/user-auth-service';


const features = [
    "Conteúdo exclusivo e sem censura.",
    "Acesso a vídeos e ensaios completos.",
    "Atualizações semanais com novas produções.",
    "Comunidade e interação direta.",
];

const FeatureList = () => (
    <div className="relative w-full overflow-hidden bg-background py-4">
        <div className="flex animate-marquee whitespace-nowrap">
            {features.map((feature, index) => (
                <span key={index} className="flex items-center mx-4 text-muted-foreground text-lg">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
            {features.map((feature, index) => (
                 <span key={`dup-${index}`} className="flex items-center mx-4 text-muted-foreground text-lg" aria-hidden="true">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
        </div>
    </div>
);


const PayPalWrapper = ({ priceInfo, customerInfo, onPaymentSuccess }: { priceInfo: any, customerInfo: {name: string, email: string}, onPaymentSuccess: (details: any) => void }) => {
    const { toast } = useToast();
    const [clientId, setClientId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClientId = async () => {
            setIsLoading(true);
            try {
                const id = await getPayPalClientId();
                if (!id) throw new Error("Client ID do PayPal não foi recebido do servidor.");
                setClientId(id);
            } catch (error: any) {
                console.error("Erro ao buscar Client ID do PayPal:", error);
                toast({
                    variant: "destructive",
                    title: "Erro de Configuração do PayPal",
                    description: error.message || "Não foi possível carregar as credenciais de pagamento.",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchClientId();
    }, [toast]);

    if (isLoading) {
        return (
             <div className="h-20 flex justify-center items-center bg-gray-800 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        );
    }

    if (!clientId) {
        return (
             <div className="h-20 flex justify-center items-center bg-gray-800 rounded-md">
                <p className="text-xs text-white">Chave do cliente PayPal não encontrada.</p>
            </div>
        );
    }
    
    // O botão do Google Pay via PayPal funciona melhor com moedas suportadas globalmente.
    // Vamos renderizar o botão padrão do PayPal para BRL.
    if (priceInfo.currencyCode !== 'BRL') {
        return null;
    }

    return (
        <PayPalScriptProvider options={{ clientId: clientId, currency: "BRL" }}>
            <PayPalButtons
                style={{ layout: "horizontal", label: "subscribe", height: 48 }}
                disabled={!customerInfo.name || !customerInfo.email}
                createOrder={async (data, actions) => {
                    try {
                        const { orderID } = await createPayPalOrder({
                            amount: priceInfo.amount,
                            currencyCode: "BRL",
                        });
                        if (!orderID) throw new Error("Falha ao criar a ordem no servidor.");
                        return orderID;
                    } catch (error: any) {
                        toast({ variant: 'destructive', title: 'Erro do PayPal', description: error.message });
                        return '';
                    }
                }}
                onApprove={async (data, actions) => {
                    try {
                        const { success, details } = await capturePayPalOrder({ orderID: data.orderID });
                        if (success) {
                            onPaymentSuccess(details);
                        } else {
                            throw new Error('Falha ao capturar o pagamento.');
                        }
                    } catch (error: any) {
                        toast({ variant: 'destructive', title: 'Erro na Aprovação', description: error.message });
                    }
                }}
                onError={(err) => {
                    toast({ variant: 'destructive', title: 'Erro no Pagamento PayPal', description: 'Ocorreu um erro inesperado.' });
                    console.error("Erro do PayPal Buttons:", err);
                }}
            />
        </PayPalScriptProvider>
    );
};

export default function Home() {
    const { toast } = useToast();
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [priceInfo, setPriceInfo] = useState({ amount: 99.00, currencyCode: 'BRL', currencySymbol: 'R$' });
    const [isPriceLoading, setIsPriceLoading] = useState(true);
    
    // Subscription Dialog State
    const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    // PIX Dialog State
    const [isPixDialogOpen, setIsPixDialogOpen] = useState(false);
    const [pixDetails, setPixDetails] = useState<CreatePixPaymentOutput | null>(null);
    const [isPixLoading, setIsPixLoading] = useState(false);

    useEffect(() => {
        const fetchCurrency = async () => {
            setIsPriceLoading(true);
            try {
                const userLocale = navigator.language || 'pt-BR';
                const result = await convertCurrency({ targetLocale: userLocale });
                setPriceInfo(result);
            } catch (error) {
                console.error("Erro ao converter moeda. Usando BRL como padrão.", error);
                setPriceInfo({ amount: 99.00, currencyCode: 'BRL', currencySymbol: 'R$' });
            } finally {
                setIsPriceLoading(false);
            }
        };
        fetchCurrency();
    }, []);

    const handleOpenSubscriptionDialog = () => {
        setIsSubscriptionDialogOpen(true);
    };

    const handlePaymentSuccess = async (details: any) => {
        const payerName = details?.payer?.name?.given_name || customerName;
        const payerEmail = details?.payer?.email_address || customerEmail;

        toast({
            title: "Pagamento Aprovado!",
            description: `Obrigado, ${payerName}. Seu acesso foi liberado.`,
        });

        localStorage.setItem('hasPaid', 'true');
        localStorage.setItem('hasSubscription', 'true');
        localStorage.setItem('customerEmail', payerEmail);

        await savePaymentDetails({
            paymentId: details.id,
            customerEmail: payerEmail,
            customerName: payerName,
        });

        setIsSubscriptionDialogOpen(false);
        router.push('/dashboard');
    };

    const handleGeneratePix = async () => {
        if (!customerName || !customerEmail) {
            toast({ variant: 'destructive', title: 'Por favor, preencha nome e email.' });
            return;
        }
        setIsPixLoading(true);
        setPixDetails(null);
        try {
            const result = await createPixPayment({ amount: priceInfo.amount, email: customerEmail });
            if (result.error) {
                throw new Error(result.error);
            }
            setPixDetails(result);
            setIsPixDialogOpen(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro ao Gerar PIX', description: error.message });
        } finally {
            setIsPixLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Código PIX copiado!' });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-white p-4">
            <div className="absolute inset-0 w-full h-full bg-black"></div>
            <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto">
                 <h2 
                    className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-shadow-neon-red-light animate-pulse-glow"
                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                >
                    Plataforma de Assinatura
                </h2>

                <p className="max-w-2xl mx-auto mb-8 text-muted-foreground md:text-xl">
                    Acesso exclusivo ao meu universo de conteúdo. Uma jornada sem censura por todos os meus fetiches e fantasias.
                </p>

                <div className="bg-card/50 border border-primary/20 rounded-lg p-8 w-full max-w-sm shadow-neon-red-strong backdrop-blur-sm">
                    <h3 className="text-2xl font-bold">Assinatura Mensal</h3>
                     <div className="my-6">
                        {isPriceLoading ? (
                           <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                        ) : (
                           <span className="text-5xl font-extrabold text-primary">
                             {priceInfo.currencySymbol} {priceInfo.amount.toFixed(2)}
                           </span>
                        )}
                        <span className="text-muted-foreground">/mês</span>
                    </div>

                    <Button 
                        className="w-full h-14 text-xl bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong" 
                        onClick={handleOpenSubscriptionDialog}
                    >
                       Assinar Agora
                    </Button>
                </div>
                
                 <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                     <Separator className="w-24 bg-primary/30 sm:hidden" />
                      <Button variant="ghost" onClick={() => setIsAuthModalOpen(true)} className="text-lg text-muted-foreground hover:text-primary hover:bg-transparent">
                        <KeyRound className="mr-2" />
                        Já sou membro
                    </Button>
                    <Separator className="w-24 bg-primary/30 sm:hidden" />
                </div>
            </main>
            
            <FeatureList />
            <AboutSection />

            <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />

            <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-card border-primary/50 text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-primary text-shadow-neon-red-light">Finalizar Assinatura</DialogTitle>
                        <DialogDescription>
                           Preencha seus dados para completar o pagamento de {priceInfo.currencySymbol}{priceInfo.amount.toFixed(2)}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nome</Label>
                            <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                     <DialogFooter className="flex flex-col gap-4">
                        <Button 
                            onClick={handleGeneratePix} 
                            disabled={isPixLoading || !customerName || !customerEmail} 
                            className="w-full h-12 text-base bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                            {isPixLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            Pagar com PIX
                        </Button>
                        <PayPalWrapper 
                           priceInfo={priceInfo}
                           customerInfo={{name: customerName, email: customerEmail}}
                           onPaymentSuccess={handlePaymentSuccess}
                        />
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             <Dialog open={isPixDialogOpen} onOpenChange={setIsPixDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border-primary/50 text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-primary text-shadow-neon-red-light">Pague com PIX</DialogTitle>
                        <DialogDescription>
                           Escaneie o QR Code com o app do seu banco ou copie o código abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        {pixDetails?.qrCodeBase64 ? (
                            <Image 
                                src={`data:image/jpeg;base64,${pixDetails.qrCodeBase64}`} 
                                alt="PIX QR Code" 
                                width={256} 
                                height={256}
                                className="rounded-lg border-4 border-primary p-1"
                                data-ai-hint="qr code"
                            />
                        ) : (
                             <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                                <p>Erro ao carregar QR Code.</p>
                             </div>
                        )}
                        <div className="w-full space-y-2">
                             <Label htmlFor="pix-code">PIX Copia e Cola</Label>
                             <div className="flex items-center gap-2">
                                <Input id="pix-code" value={pixDetails?.qrCode || ''} readOnly className="font-mono text-xs"/>
                                <Button size="icon" variant="outline" onClick={() => pixDetails?.qrCode && copyToClipboard(pixDetails.qrCode)}>
                                    <Copy className="h-4 w-4"/>
                                </Button>
                             </div>
                        </div>
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Aguardando Pagamento</AlertTitle>
                          <AlertDescription>
                            Após a confirmação, seu acesso será liberado automaticamente. Você pode fechar esta janela.
                          </AlertDescription>
                        </Alert>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
