
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Fingerprint, ShieldCheck, UserPlus, Mail, Phone, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { registerUser, verifyUser } from '@/ai/flows/face-auth-flow';

interface AuthModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

// Componente para o painel de vídeo, movido para fora para estabilidade.
const VideoPanel = ({ videoCallbackRef, isVerifying, hasCameraPermission }: { 
    videoCallbackRef: (node: HTMLVideoElement | null) => void, 
    isVerifying: boolean, 
    hasCameraPermission: boolean 
}) => (
    <div className="relative mx-auto w-full max-w-sm h-64 bg-muted rounded-lg overflow-hidden border border-primary/50 shadow-neon-red-light">
        <video ref={videoCallbackRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {isVerifying && <div className="absolute inset-0 border-4 border-primary animate-pulse"></div>}
        {!hasCameraPermission && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                <Alert variant="destructive" className="bg-destructive/80 text-destructive-foreground border-destructive-foreground/50">
                    <AlertTitle>Acesso à Câmera Necessário</AlertTitle>
                    <AlertDescription>
                        Por favor, permita o acesso à câmera para usar esta funcionalidade.
                    </AlertDescription>
                </Alert>
            </div>
        )}
    </div>
);

// Componente para campos de entrada, movido para fora para estabilidade.
const InputField = ({ id, label, icon, type, value, onChange }: { 
    id: string, 
    label: string, 
    icon: React.ReactNode, 
    type: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
            {icon} {label}
        </Label>
        <Input 
            id={id} 
            type={type} 
            value={value} 
            onChange={onChange} 
            required 
            className="h-11 bg-background/50 border-primary/30 focus:shadow-neon-red-light" 
        />
    </div>
);


export default function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // State for registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      if (mediaStream && node.srcObject !== mediaStream) {
        node.srcObject = mediaStream;
      }
    }
  }, [mediaStream]);

  const stopCamera = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
      setHasCameraPermission(false);
    }
  }, [mediaStream]);
  
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Câmera não Suportada',
          description: 'Seu navegador não suporta acesso à câmera.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setMediaStream(stream);
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        setHasCameraPermission(false);
        setMediaStream(null);
        toast({
          variant: 'destructive',
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, habilite as permissões da câmera nas configurações do seu navegador.',
        });
      }
    };

    if (isOpen && !mediaStream) {
        getCameraPermission();
    } else if (!isOpen) {
        stopCamera();
    }

  }, [isOpen, mediaStream, stopCamera, toast]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
        stopCamera();
    }
  }


  const captureImage = (): string | null => {
    if (!videoRef.current || videoRef.current.readyState < 3 || videoRef.current.videoWidth === 0) {
      toast({
          variant: 'destructive',
          title: 'Erro de Inicialização',
          description: 'A câmera ainda está inicializando. Por favor, tente novamente em um momento.',
      });
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
    }
    
    toast({
        variant: 'destructive',
        title: 'Erro no Canvas',
        description: 'Não foi possível capturar a imagem do stream de vídeo.',
    });
    return null;
  };
  
  const handleAuthAction = async (action: 'login' | 'register') => {
    if (!hasCameraPermission) {
        toast({
            variant: 'destructive',
            title: 'Câmera não está Pronta',
            description: 'Por favor, conceda acesso à câmera e espere ela inicializar.',
        });
        //return;
    }
    
    if (action === 'register' && (!name || !email)) {
      toast({
        variant: 'destructive',
        title: 'Formulário Incompleto',
        description: 'Por favor, preencha nome e email para se cadastrar.',
      });
      return;
    }

    setIsVerifying(true);
    toast({ title: 'Analisando rosto...', description: 'Por favor, olhe para a câmera.' });

    const imageBase64 = captureImage();
    
    if (imageBase64) {
        try {
            let result;
            if (action === 'register') {
                result = await registerUser({ name, email, phone, imageBase64 });
                if (result.success) {
                    toast({ title: 'Cadastro bem-sucedido!', description: result.message });
                    router.push('/dashboard'); 
                } else {
                     toast({ variant: 'destructive', title: 'Falha no Cadastro', description: result.message || 'Não foi possível registrar seu rosto.' });
                }
            } else { // 'login'
                result = await verifyUser({ imageBase64 });
                 if (result.success && result.redirectUrl) {
                    toast({ title: 'Login bem-sucedido!', description: 'Redirecionando...' });
                    localStorage.setItem('isAuthenticated', 'true'); 
                    window.location.href = result.redirectUrl; // Full page redirect
                } else {
                    toast({ variant: 'destructive', title: 'Falha na Autenticação', description: result.message || 'Rosto não reconhecido.' });
                }
            }
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Ocorreu um Erro',
                description: error.message || 'Algo deu errado durante a verificação.',
            });
        } finally {
            setIsVerifying(false);
        }
    } else {
        setIsVerifying(false);
        toast({
            variant: 'destructive',
            title: 'Falha na Captura',
            description: 'Não foi possível capturar a imagem da câmera.',
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md shadow-neon-red-strong border-primary/50 bg-card/80 backdrop-blur-xl p-0">
          <DialogHeader className="text-center pb-2 relative p-6">
            <div className="flex justify-center items-center mb-4 pt-8">
                <ShieldCheck className="h-12 w-12 text-primary text-shadow-neon-red" />
            </div>
            <DialogTitle className="text-3xl font-bold tracking-tight text-foreground text-shadow-neon-red-light">
                AuthKit
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
                Autenticação Facial Segura
            </DialogDescription>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </DialogClose>
          </DialogHeader>
          <div className="px-6 pb-6">
            <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-primary/20">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light">Entrar</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light">Cadastrar</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                    <div className="space-y-4 pt-4">
                        <VideoPanel videoCallbackRef={videoCallbackRef} isVerifying={isVerifying} hasCameraPermission={hasCameraPermission} />
                        <Button onClick={() => handleAuthAction('login')} disabled={(!hasCameraPermission || isVerifying) && false} className="w-full justify-center h-12 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong">
                        <Fingerprint className="w-5 h-5 mr-2" />
                        {isVerifying ? 'Verificando...' : 'Entrar com Face ID'}
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="signup">
                    <div className="space-y-4 pt-4">
                        <InputField id="name" label="Nome Completo" icon={<UserPlus size={16} />} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        <InputField id="email" label="Endereço de Email" icon={<Mail size={16} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <InputField id="phone" label="Número de Telefone" icon={<Phone size={16} />} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <VideoPanel videoCallbackRef={videoCallbackRef} isVerifying={isVerifying} hasCameraPermission={hasCameraPermission} />
                        <Button onClick={() => handleAuthAction('register')} disabled={!hasCameraPermission || isVerifying || !name || !email} className="w-full justify-center h-12 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong">
                        <Fingerprint className="w-5 h-5 mr-2" />
                        {isVerifying ? 'Verificando...' : 'Cadastrar com Face ID'}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
          </div>
      </DialogContent>
    </Dialog>
  );
}
