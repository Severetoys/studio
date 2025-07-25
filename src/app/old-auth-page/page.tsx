
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24">
        <path d="M12 2.04C6.51 2.04 2 6.55 2 12.04c0 5.09 3.73 9.32 8.6 9.95v-7.06h-2.54v-2.89h2.54V9.07c0-2.52 1.54-3.9 3.78-3.9 1.09 0 2.04.19 2.32.28v2.6h-1.55c-1.22 0-1.46.58-1.46 1.43v1.88h2.95l-.48 2.89h-2.47v7.06c4.87-.63 8.6-4.86 8.6-9.95.01-5.49-4.5-10-9.99-10z"/>
    </svg>
);


export default function OldAuthPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loginStatus, setLoginStatus] = useState('unknown'); // 'connected', 'not_authorized', 'unknown'
  const [userData, setUserData] = useState<{name: string, email?: string, picture?: string} | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Garantir que o SDK do FB seja parseado quando o componente for montado
    if (window.FB) {
        window.FB.XFBML.parse();
    }
  }, []);

  const statusChangeCallback = (response: any) => {
    if (response.status === 'connected') {
      setLoginStatus('connected');
      fetchUserData();
    } else {
      setLoginStatus('unknown');
      setUserData(null);
    }
  };

  const checkLoginState = () => {
    if (window.FB) {
      window.FB.getLoginStatus(function(response: any) {
        statusChangeCallback(response);
      });
    }
  };
  
  const fetchUserData = () => {
    if (window.FB) {
      window.FB.api('/me', {fields: 'name,email,picture'}, function(response: any) {
        setUserData({
            name: response.name,
            email: response.email,
            picture: response.picture?.data?.url
        });
      });
    }
  }

  const handleLogin = () => {
     if (window.FB) {
        window.FB.login(function(response: any) {
            statusChangeCallback(response);
        }, {scope: 'public_profile,email'});
     }
  };

  const handleLogout = () => {
    if (window.FB) {
      window.FB.logout(function(response: any) {
        statusChangeCallback(response);
      });
    }
  };
  
  // Substitui a necessidade de `window.onload`
  useEffect(() => {
    const interval = setInterval(() => {
        if (typeof window.FB !== 'undefined') {
            checkLoginState();
            clearInterval(interval);
        }
    }, 100);

    return () => clearInterval(interval);
  }, []);


  if (!isClient) {
    return null;
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-primary" onClick={() => router.push('/')}>
            <ArrowLeft />
          </Button>
          <div className="flex justify-center mb-2 pt-8">
             <FacebookIcon className="h-12 w-12 text-blue-600"/>
          </div>
          <CardTitle className="text-3xl text-shadow-neon-red-light">Acesso via Facebook</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Use sua conta do Facebook para um acesso rápido e seguro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginStatus === 'connected' && userData ? (
            <div className="space-y-4">
                <Avatar className="w-24 h-24 mx-auto border-2 border-primary">
                    <AvatarImage src={userData.picture} alt={userData.name} />
                    <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <p className="font-semibold text-xl text-foreground">Bem-vindo(a), {userData.name}!</p>
                    <p className="text-sm text-muted-foreground">{userData.email || 'Email não fornecido'}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-500">
                    <CheckCircle className="h-5 w-5"/>
                    <span className="font-semibold">Conectado com sucesso</span>
                </div>
                <Button onClick={() => router.push('/dashboard')} className="w-full h-11 text-base" >
                   Ir para o Painel
                </Button>
                 <Button onClick={handleLogout} variant="secondary" className="w-full h-11 text-base">
                    <LogOut className="mr-2" />
                    Sair
                </Button>
            </div>
          ) : (
             <Button onClick={handleLogin} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300">
                <FacebookIcon className="mr-3 h-6 w-6"/>
                Entrar com Facebook
            </Button>
          )}
        </CardContent>
         <CardFooter className="flex flex-col gap-4 pt-6">
            <Separator />
             <div
                className="fb-like"
                data-href="https://www.facebook.com/facebook" 
                data-width=""
                data-layout="standard"
                data-action="like"
                data-size="large"
                data-share="true">
            </div>
        </CardFooter>
      </Card>
    </main>
  );
}

    