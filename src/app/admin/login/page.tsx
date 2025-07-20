
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Fingerprint, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyFace } from '@/ai/flows/face-auth-flow';

const ADMIN_PASSWORD = "Severe123@";
const ADMIN_EMAIL = "pix@italosantos.com";

interface AdminLoginPageProps {
  onAuthSuccess: () => void;
}

export default function AdminLoginPage({ onAuthSuccess }: AdminLoginPageProps) {
  const [step, setStep] = useState<'credentials' | 'face'>('credentials');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      videoRef.current = node;
      if (mediaStream && node.srcObject !== mediaStream) {
        node.srcObject = mediaStream;
      }
    }
  }, [mediaStream]);

  const requestCameraPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({ variant: 'destructive', title: 'Câmera não Suportada' });
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setMediaStream(stream);
      return true;
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      setHasCameraPermission(false);
      setMediaStream(null);
      toast({ variant: 'destructive', title: 'Acesso à Câmera Negado' });
      return false;
    }
  };

  const handleCredentialsSubmit = async () => {
    setIsLoggingIn(true);
    setError('');

    if (password === ADMIN_PASSWORD && email.toLowerCase() === ADMIN_EMAIL) {
      toast({ title: "Credenciais validadas!", description: "Por favor, complete a verificação facial." });
      const cameraReady = await requestCameraPermission();
      if (cameraReady) {
        setStep('face');
      }
    } else {
      setError("Credenciais incorretas. Por favor, tente novamente.");
      toast({ variant: "destructive", title: "Falha na Autenticação", description: "Senha ou email incorretos." });
    }
    setIsLoggingIn(false);
  };
  
  const captureImage = (): string | null => {
    if (!videoRef.current || videoRef.current.readyState < 3 || videoRef.current.videoWidth === 0) {
      toast({ variant: 'destructive', title: 'Erro de Câmera', description: 'A câmera ainda não está pronta.' });
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
    return null;
  };

  const handleFaceVerification = async () => {
    setIsLoggingIn(true);
    const imageBase64 = captureImage();
    if (!imageBase64) {
        setIsLoggingIn(false);
        return;
    }
    
    try {
        const result = await verifyFace({ liveImage: imageBase64 });
        if (result.isMatch) {
            toast({ title: "Login bem-sucedido!", description: "Bem-vindo ao painel." });
            localStorage.setItem("adminAuthenticated", "true");
            onAuthSuccess();
            router.push('/admin');
        } else {
            toast({ variant: "destructive", title: "Falha no Face ID", description: result.reason || 'Rosto não reconhecido.' });
        }
    } catch (e: any) {
        toast({ variant: "destructive", title: "Erro na Verificação", description: e.message });
    } finally {
        setIsLoggingIn(false);
    }
  };
  
  const VideoPanel = () => (
    <div className="relative mx-auto w-full max-w-sm h-56 bg-muted rounded-lg overflow-hidden border border-primary/50 shadow-neon-red-light">
        <video ref={videoCallbackRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {isLoggingIn && <div className="absolute inset-0 border-4 border-primary animate-pulse"></div>}
        {!hasCameraPermission && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
              <Alert variant="destructive">
                <AlertTitle>Acesso à Câmera Necessário</AlertTitle>
              </Alert>
            </div>
        )}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <ShieldCheck className="h-10 w-10 text-primary"/>
          </div>
          <CardTitle className="text-2xl">Acesso Restrito ao Painel</CardTitle>
          <CardDescription>
            {step === 'credentials'
              ? "Insira suas credenciais para continuar."
              : "Posicione seu rosto na câmera para finalizar."}
          </CardDescription>
        </CardHeader>
        
        {step === 'credentials' ? (
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCredentialsSubmit()}
                placeholder="********"
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
        ) : (
            <CardContent className="space-y-4">
                <VideoPanel />
            </CardContent>
        )}

        <CardFooter>
            {step === 'credentials' ? (
                <Button type="button" className="w-full" onClick={handleCredentialsSubmit} disabled={isLoggingIn}>
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoggingIn ? 'Verificando...' : 'Próximo Passo'}
                </Button>
            ) : (
                 <Button className="w-full" onClick={handleFaceVerification} disabled={isLoggingIn || !hasCameraPermission}>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    {isLoggingIn ? 'Autenticando...' : 'Confirmar Login Facial'}
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
