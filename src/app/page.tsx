
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
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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


export default function HomePage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [priceInfo, setPriceInfo] = useState<{amount: number, currencyCode: string, currencySymbol: string} | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const { toast } = useToast();
  
  // State for Pix Modal
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixEmail, setPixEmail] = useState('');
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<CreatePixPaymentOutput | null>(null);
  

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
  
  const handlePaymentSuccess = () => {
    localStorage.setItem('hasPaid', 'true');
    toast({
        title: "Pagamento Aprovado!",
        description: "Você será redirecionado para a autenticação para finalizar seu acesso."
    });
    router.push('/dashboard');
  }
  
  const handleGeneratePix = async () => {
      if (!pixEmail) {
          toast({ variant: 'destructive', title: 'Email obrigatório', description: 'Por favor, insira seu e-mail para gerar o Pix.' });
          return;
      }
      if (!priceInfo) return;

      setIsGeneratingPix(true);
      setPixData(null);
      try {
          const result = await createPixPayment({
              amount: priceInfo.amount,
              email: pixEmail
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
                {/* Botão Google Pay */}
                <Button onClick={handlePaymentSuccess} className="h-16 flex-1 bg-black text-white border border-white/50 hover:bg-gray-800 p-0 overflow-hidden">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58%20(1).jpeg?alt=media&token=00683b6b-59ac-483c-93f4-6c879ab9b86c" alt="Pagar com Google Pay" width={156} height={68} className="object-contain" data-ai-hint="payment button" />
                </Button>
                
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
                
                {/* Botão Apple Pay */}
                <Button onClick={handlePaymentSuccess} className="h-16 flex-1 bg-black text-white border border-white/50 hover:bg-gray-800 p-0 overflow-hidden">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=3a91ba87-6df8-41db-a3bd-64f720e7feb2" alt="Pagar com Apple Pay" width={156} height={68} className="object-contain" data-ai-hint="payment button" />
                </Button>
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
                    {pixData ? 'Escaneie o QR Code com seu aplicativo de banco.' : 'Insira seu e-mail para gerar o código Pix.'}
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
                    <p className="text-xs text-muted-foreground">Após o pagamento, o acesso será liberado automaticamente.</p>
                </div>
            ) : !isGeneratingPix && (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Seu e-mail</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="seu.email@exemplo.com"
                            value={pixEmail}
                            onChange={(e) => setPixEmail(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <DialogFooter>
                {!pixData && (
                    <Button type="button" onClick={handleGeneratePix} disabled={isGeneratingPix || !pixEmail} className="w-full">
                       {isGeneratingPix ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : null}
                       {isGeneratingPix ? 'Gerando...' : 'Gerar QR Code Pix'}
                    </Button>
                )}
                 {pixData && (
                    <Button type="button" onClick={() => { setIsPixModalOpen(false); setPixData(null); }} className="w-full">
                       Fechar
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
