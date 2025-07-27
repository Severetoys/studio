og>
    </>
  );
}
ort { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle, Loader2, KeyRound, Copy } from 'lucide-react';
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
                if (!id || id === 'YOUR_PAYPAL_CLIENT_ID') throw new Error("Client ID do PayPal não foi recebido do servidor.");
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
        <PayPalScriptProvider options={{ clientId: clientId, currency: "BRL", components: "buttons" }}>
            <PayPalButtons
                style={{ layout: "horizontal", tagline: false, height: 55, color: 'blue' }}
                createOrder={async (data, actions) => {
                    try {
                        const result = await createPayPalOrder({ amount: priceInfo.amount, currencyCode: "BRL" });
                        if (result.orderID) {
                            return result.orderID;
                        }
                        throw new Error(result.error || "Falha ao criar ordem no servidor.");
                    } catch (error: any) {
                        toast({ variant: 'destructive', title: 'Erro ao Criar Pedido', description: error.message });
                        return '';
                    }
                }}
                onApprove={async (data, actions) => {
                    try {
                        if (!actions.order) {
                            throw new Error('A ordem de captura não está disponível.');
                        }
                        const details = await actions.order.capture();
                        onPaymentSuccess(details);
                    } catch (error: any) {
                         toast({ variant: 'destructive', title: 'Erro na Aprovação', description: error.message });
                    }
                }}
                 onError={(err) => {
                    toast({ variant: 'destructive', title: 'Erro no Pagamento', description: 'Ocorreu um erro inesperado com o PayPal.'});
                    console.error("Erro no PayPal Button: ", err);
                }}
                fundingSource="paypal"
                disabled={!customerInfo.name || !customerInfo.email}
            />
        </PayPalScriptProvider>
    );
}


export default function HomePage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [priceInfo, setPriceInfo] = useState<{amount: number, currencyCode: string, currencySymbol: string} | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const { toast } = useToast();
  
  // State for Pix Modal
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<CreatePixPaymentOutput | null>(null);
  
  const handlePaymentSuccess = async (details: any) => {
      // Salva o e-mail no localStorage para ser usado pelo AuthModal
      localStorage.setItem('customerEmail', customerEmail);
      localStorage.setItem('customerName', customerName);
      localStorage.setItem('hasPaid', 'true');
      
      toast({
          title: "Pagamento Aprovado!",
          description: "Você será redirecionado para a autenticação para finalizar seu acesso."
      });

      try {
        await savePaymentDetails({
            paymentId: details.id || `pix_${Date.now()}`,
            customerEmail: customerEmail,
            customerName: customerName,
        });
      } catch (error) {
        console.error("Falha ao salvar detalhes do pagamento:", error);
      }
      
      setIsPixModalOpen(false);
      setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const userLocale = navigator.language || 'pt-BR';
    const getLocalCurrency = async () => {
      try {
        const response = await convertCurrency({ targetLocale: userLocale });
        setPriceInfo(response);
      } catch (error) {
        console.error("Failed to convert currency, defaulting to BRL.", error);
        setPriceInfo({ amount: 99.00, currencyCode: 'BRL', currencySymbol: 'R$' });
      } finally {
        setIsLoadingPrice(false);
      }
    };
    
    getLocalCurrency();
    
  }, []);
  
  const handleGeneratePix = async () => {
      if (!customerEmail || !customerName) {
          toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Por favor, insira seu nome e e-mail para gerar o Pix.' });
          return;
      }
      if (!priceInfo) return;

      setIsGeneratingPix(true);
      setPixData(null);
      try {
          const result = await createPixPayment({
              amount: priceInfo.amount,
              email: customerEmail
          });
          if (result.qrCodeBase64) {
              setPixData(result);
              toast({ title: 'QR Code gerado com sucesso!' });
          } else {
              throw new Error(result.error || 'Falha ao gerar QR Code.');
          }
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Erro ao gerar Pix', description: error.message });
      } finally {
          setIsGeneratingPix(false);
      }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado para a área de transferência!" });
  };
  
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="p-4 md:p-8 bg-background flex flex-col items-center gap-6 w-full max-w-md text-center">
          
          <div className="w-full space-y-4">
              <Button 
                  className="w-full h-20 bg-primary/90 hover:bg-primary text-primary-foreground text-3xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
                  onClick={() => setIsAuthModalOpen(true)}>
                  <Fingerprint className="h-12 w-12 mr-4" />
                  Face ID
              </Button>
            
            <div className="flex items-center justify-center gap-2">
                 {!isLoadingPrice && priceInfo && (
                     <div className="flex-1">
                        <PayPalWrapper priceInfo={priceInfo} customerInfo={{name: customerName, email: customerEmail}} onPaymentSuccess={handlePaymentSuccess} />
                    </div>
                 )}
                
                {/* Botão Pix */}
                 {!isLoadingPrice && (
                    <button
                        onClick={() => setIsPixModalOpen(true)}
                        className="w-24 h-16 bg-transparent border-none p-0 transition-transform duration-200 ease-in-out hover:scale-105"
                        aria-label="Pagar com Pix"
                      >
                        <Image
                          src='https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649'
                          alt="Pix payment button"
                          width={96}
                          height={67}
                          className="object-contain w-full h-full mix-blend-screen"
                          data-ai-hint="payment button"
                          unoptimized
                        />
                    </button>
                 )}
            </div>
            
             <div className="text-center py-4 space-y-4">
                {isLoadingPrice ? (
                     <div className="flex items-center justify-center h-[72px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    </div>
                ) : (
                    priceInfo && (
                       <div className="text-center">
                            <p className="text-muted-foreground">Assinatura Mensal</p>
                            <h3 className="font-bold text-6xl text-primary text-shadow-neon-red animate-pulse-glow">
                                {priceInfo.currencySymbol} {priceInfo.amount.toFixed(2)}
                                <span className="text-lg text-muted-foreground ml-1">{priceInfo.currencyCode}</span>
                            </h3>
                        </div>
                    )
                )}
            </div>

            <Button 
                className="w-full h-16 bg-primary/90 hover:bg-primary text-primary-foreground text-2xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
                onClick={() => setIsAuthModalOpen(true)}>
                <KeyRound className="h-10 w-10 mr-4" />
                ENTRAR
            </Button>
          </div>
        </div>
        <FeatureList />
        <AboutSection />
      </div>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
      
      {/* Pix Payment Modal */}
      <Dialog open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-xl border-primary/50">
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary text-shadow-neon-red-light">Pagamento com Pix</DialogTitle>
                <DialogDescription>
                    {pixData ? 'Escaneie o QR Code com seu aplicativo de banco.' : 'Insira seus dados para gerar o código Pix.'}
                </DialogDescription>
            </DialogHeader>

            {isGeneratingPix && (
                 <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            )}

            {!isGeneratingPix && pixData?.qrCodeBase64 ? (
                <div className="space-y-4 text-center">
                    <Image
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="Pix QR Code"
                        width={256}
                        height={256}
                        className="mx-auto rounded-lg border-4 border-primary"
                        data-ai-hint="qr code"
                    />
                    <Label htmlFor="pix-code">Ou copie o código:</Label>
                    <div className="relative">
                       <Input id="pix-code" readOnly value={pixData.qrCode} className="pr-10 text-xs font-mono"/>
                       <Button size="icon" variant="ghost" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8" onClick={() => copyToClipboard(pixData.qrCode || '')}>
                            <Copy className="h-4 w-4"/>
                       </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Após o pagamento, clique em continuar para finalizar seu acesso.</p>
                </div>
            ) : !isGeneratingPix && (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input 
                            id="name" 
                            type="text" 
                            placeholder="Seu nome completo"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Seu e-mail</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="seu.email@exemplo.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <DialogFooter>
                {!pixData ? (
                    <Button type="button" onClick={handleGeneratePix} disabled={isGeneratingPix || !customerEmail || !customerName} className="w-full">
                       {isGeneratingPix ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : null}
                       {isGeneratingPix ? 'Gerando...' : 'Gerar QR Code Pix'}
                    </Button>
                ) : (
                    <Button type="button" onClick={() => handlePaymentSuccess({ id: 'pix_payment' })} className="w-full">
                       Já paguei, continuar
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dial