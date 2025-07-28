"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Fingerprint, ShieldCheck, UserPlus, Mail, Phone, VideoOff, KeyRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from '@/components/ui/card';
import { verifyUser } from '@/ai/flows/face-auth-flow';
import { registerUserWithGoogleSheet, type RegisterUserOutput } from '@/ai/flows/google-sheets-auth-flow';

const VideoPanel = ({ videoRef, isVerifying, hasCameraPermission }: { 
    videoRef: React.RefObject<HTMLVideoElement>, 
    isVerifying: boolean, 
    hasCameraPermission: boolean 
}) => (
    <div className="relative mx-auto w-full max-w-sm h-64 bg-muted rounded-lg overflow-hidden border border-primary/50 shadow-neon-red-light">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {isVerifying && <div className="absolute inset-0 border-4 border-primary animate-pulse"></div>}
        {!hasCameraPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
                 <VideoOff className="w-12 h-12 text-destructive mb-4" />
                <Alert variant="destructive" className="bg-transparent text-destructive-foreground border-0">
                    <AlertTitle>Câmera Indisponível</AlertTitle>
                    <AlertDescription>
                        Por favor, permita o acesso à câmera no seu navegador para continuar.
                    </AlertDescription>
                </Alert>
            </div>
        )}
    </div>
);

const InputField = ({ id, label, icon, type, value, onChange, placeholder }: { 
    id: string, 
    label: string, 
    icon: React.ReactNode, 
    type: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string
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
            placeholder={placeholder}
            className="h-11 bg-background/50 border-primary/30 focus:shadow-neon-red-light" 
        />
    </div>
);

export default function FaceAuthPage() {
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
    setHasCameraPermission(false);
  }, []);

  const startCamera = useCallback(async () => {
      if (mediaStreamRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à Câmera Negado',
          description: 'Por favor, habilite a câmera nas configurações do seu navegador.',
        });
      }
  }, [toast]);

  useEffect(() => {
    startCamera();
    return () => {
        stopCamera();
    };
  }, [startCamera, stopCamera]);


  const captureImage = (): string | null => {
    const video = videoRef.current;
    if (!video || !video.srcObject || video.readyState < 3 || video.videoWidth === 0) {
      toast({
          variant: 'destructive',
          title: 'Erro de Câmera',
          description: 'A câmera não está pronta. Tente novamente em alguns segundos.',
      });
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };
  
  const handleFaceAuthAction = async (action: 'login' | 'register') => {
    if (!hasCameraPermission) {
        toast({ variant: 'destructive', title: 'Câmera Desativada', description: 'Por favor, conceda acesso à câmera.' });
        return;
    }
    
    if (action === 'register' && (!name || !loginEmail)) {
      toast({ variant: 'destructive', title: 'Formulário Incompleto', description: 'Por favor, preencha nome e email.' });
      return;
    }

    setIsVerifying(true);
    toast({ title: 'Analisando rosto...', description: 'Por favor, olhe para a câmera e aguarde.' });

    await new Promise(resolve => setTimeout(resolve, 500));

    const imageBase64 = captureImage();
    if (!imageBase64) {
        setIsVerifying(false);
        return;
    }
    
    try {
        if (action === 'register') {
            const result: RegisterUserOutput = await registerUserWithGoogleSheet({ name, email: loginEmail, phone, imageBase64 });
            if (result.success) {
                toast({ title: 'Cadastro bem-sucedido!', description: result.message || 'Seu rosto e dados foram registrados. Redirecionando...' });
                localStorage.setItem('isAuthenticated', 'true');
                router.push('/assinante'); 
            } else {
                 toast({ variant: 'destructive', title: 'Falha no Cadastro', description: result.message || 'Não foi possível completar seu registro.' });
            }
        } else { // 'login'
            const result = await verifyUser({ imageBase64 });
             if (result.success && result.redirectUrl) {
                toast({ title: 'Login bem-sucedido!', description: 'Redirecionando...' });
                localStorage.setItem('isAuthenticated', 'true'); 
                window.location.href = result.redirectUrl;
            } else {
                toast({ variant: 'destructive', title: 'Falha na Autenticação', description: result.message || 'Rosto não reconhecido.' });
            }
        }
    } catch (error: any) {
        console.error(`Error during ${action}:`, error);
        toast({
            variant: 'destructive',
            title: 'Ocorreu um Erro',
            description: error.message || 'Algo deu errado durante a verificação. Tente novamente.',
        });
    } finally {
        setIsVerifying(false);
    }
  };

  const handleEmailPasswordLogin = () => {
    // Esta é uma lógica de login de fallback/demonstração. Substitua por sua lógica de autenticação real.
    if (loginEmail.toLowerCase() === 'pix@italosantos.com' && loginPassword === 'Severe123@') {
      toast({ title: 'Login bem-sucedido!', description: 'Redirecionando...' });
      localStorage.setItem('isAuthenticated', 'true'); // Define o estado de autenticado
      router.push('/assinante');
    } else {
      toast({ variant: 'destructive', title: 'Falha na Autenticação', description: 'Email ou senha incorretos.' });
    }
  };

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-neon-red-strong border-primary/50 bg-card/80 backdrop-blur-xl">
           <div className="text-center p-6 pb-2 relative">
            <div className="flex justify-center items-center mb-4 pt-8">
                <ShieldCheck className="h-12 w-12 text-primary text-shadow-neon-red" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-shadow-neon-red-light">
                AuthKit
            </h1>
            <p className="text-muted-foreground pt-2">
                Autenticação Segura
            </p>
          </div>
          <div className="p-6 pt-2">
            <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-background/50 border border-primary/20">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light">Face ID</TabsTrigger>
                    <TabsTrigger value="signin-email" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light">Email</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-neon-red-light">Cadastrar</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                    <div className="space-y-4 pt-4">
                        <VideoPanel videoRef={videoRef} isVerifying={isVerifying} hasCameraPermission={hasCameraPermission} />
                        <Button onClick={() => handleFaceAuthAction('login')} disabled={!hasCameraPermission || isVerifying} className="w-full justify-center h-12 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong">
                        <Fingerprint className="w-5 h-5 mr-2" />
                        {isVerifying ? 'Verificando...' : 'Entrar com Face ID'}
                        </Button>
                    </div>
                </TabsContent>
                 <TabsContent value="signin-email">
                    <div className="space-y-4 pt-4">
                        <InputField id="login-email" label="Email" icon={<Mail size={16} />} type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="seu@email.com" />
                        <InputField id="login-password" label="Senha" icon={<KeyRound size={16} />} type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="********" />
                        <Button onClick={handleEmailPasswordLogin} disabled={isVerifying || !loginEmail || !loginPassword} className="w-full justify-center h-12 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong">
                           <KeyRound className="w-5 h-5 mr-2" />
                           Entrar
                        </Button>
                    </div>
                </TabsContent>
                <TabsContent value="signup">
                    <div className="space-y-4 pt-4">
                        <InputField id="name" label="Nome Completo" icon={<UserPlus size={16} />} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        <InputField id="email" label="Endereço de Email" icon={<Mail size={16} />} type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                        <InputField id="phone" label="Número de Telefone" icon={<Phone size={16} />} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <VideoPanel videoRef={videoRef} isVerifying={isVerifying} hasCameraPermission={hasCameraPermission} />
                        <Button onClick={() => handleFaceAuthAction('register')} disabled={!hasCameraPermission || isVerifying || !name || !loginEmail} className="w-full justify-center h-12 text-base bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong">
                        <Fingerprint className="w-5 h-5 mr-2" />
                        {isVerifying ? 'Verificando...' : 'Cadastrar com Face ID'}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
          </div>
        </Card>
    </main>
  );
}
