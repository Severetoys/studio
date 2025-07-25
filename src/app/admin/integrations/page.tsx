
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Facebook, Instagram, Twitter, LogOut, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { connectService, disconnectService } from "../../../../dataconnect/connector/auth";

// Placeholder icons for PayPal and Mercado Pago
const PayPalIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.74,2.42,7.36,5.1a.21.21,0,0,0,.2.23l2.88-.1a.21.21,0,0,1,.21.23L9.6,13.75a.21.21,0,0,0,.21.22l2.37-.08a.21.21,0,0,1,.21.23L11.23,21.8a.22.22,0,0,0,.21.21h2.82a.22.22,0,0,0,.22-.2l2-13.43a.22.22,0,0,0-.21-.24l-3.23.11a.22.22,0,0,1-.21-.24L12.7,2.42a.21.21,0,0,0-.21-.21H8a.21.21,0,0,0-.24.21Z"/>
        <path d="M10.87,14.57,11.82.93A.21.21,0,0,0,11.61.71H8.69a.21.21,0,0,0-.21.2L7.36,7.59a.22.22,0,0,0,.21.24l2.58-.09a.21.21,0,0,1,.21.23l-.93,6.3a.21.21,0,0,0,.21.22l2.74-.09a.21.21,0,0,0,.2-.23Z"/>
    </svg>
);

const MercadoPagoIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.3,4.22a.5.5,0,0,0-.49-.49l-13,1.45a.5.5,0,0,0-.42.5V18.17a.5.5,0,0,0,.35.48l13.3,2.44a.5.5,0,0,0,.55-.38l.68-15A.5.5,0,0,0,18.3,4.22ZM12,14.07a3.5,3.5,0,1,1,3.5-3.5A3.5,3.5,0,0,1,12,14.07Z"/>
    </svg>
);

declare global {
  interface Window {
    FB: any;
  }
}

type Integration = "twitter" | "instagram" | "facebook" | "paypal" | "mercadopago";

export default function AdminIntegrationsPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState({
    twitter: false,
    instagram: false,
    facebook: false,
    paypal: false,
    mercadopago: false,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load persisted state
    try {
      const savedState = {
        twitter: localStorage.getItem("integration_twitter") === "true",
        instagram: localStorage.getItem("integration_instagram") === "true",
        facebook: localStorage.getItem("integration_facebook") === "true",
        paypal: localStorage.getItem("integration_paypal") === "true",
        mercadopago: localStorage.getItem("integration_mercadopago") === "true",
      };
      setIntegrations(savedState);
    } catch (error) {
      console.error("Failed to access localStorage", error);
    }
  }, []);

  // Effect to check FB login status on load
  useEffect(() => {
    if (!isClient) return;
    
    const checkFbStatus = () => {
        if (window.FB) {
            window.FB.getLoginStatus((response: any) => {
              if (response.status === 'connected') {
                updateIntegrationStatus('facebook', true, false);
                updateIntegrationStatus('instagram', true, false);
                localStorage.setItem('fb_access_token', response.authResponse.accessToken);
              } else {
                updateIntegrationStatus('facebook', false, false);
                updateIntegrationStatus('instagram', false, false);
                localStorage.removeItem('fb_access_token');
              }
            });
        }
    };
    
    // The SDK might not be loaded immediately.
    if (window.FB) {
      checkFbStatus();
    } else {
      window.addEventListener('fb-sdk-ready', checkFbStatus);
    }

    return () => {
       window.removeEventListener('fb-sdk-ready', checkFbStatus);
    }

  }, [isClient]);

  const updateIntegrationStatus = (integration: Integration, isConnected: boolean, showToast: boolean = true) => {
    setIntegrations(prevState => ({ ...prevState, [integration]: isConnected }));
    try {
      localStorage.setItem(`integration_${integration}`, String(isConnected));
      if (showToast) {
        toast({
            title: `Integração ${isConnected ? 'Conectada' : 'Desconectada'}`,
            description: `A integração com ${integration} foi ${isConnected ? 'ativada' : 'desativada'}.`,
        });
      }
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
        toast({ variant: "destructive", title: "SDK do Facebook não carregado."});
        return;
    }
    window.FB.login(async (response: any) => {
        if (response.status === 'connected') {
            const authResponse = await connectService('facebook');
            if (authResponse.success) {
                updateIntegrationStatus('facebook', true);
                updateIntegrationStatus('instagram', true);
                localStorage.setItem('fb_access_token', response.authResponse.accessToken);
                toast({ title: 'Conectado com Facebook!', description: 'Sua conta foi vinculada com sucesso.' });
            } else {
                 toast({ variant: 'destructive', title: 'Falha no Servidor', description: authResponse.message });
            }
        } else {
            toast({ variant: 'destructive', title: 'Login com Facebook falhou', description: 'O usuário cancelou o login ou não autorizou completamente.' });
        }
    }, { scope: 'instagram_basic,pages_show_list,instagram_content_publish', auth_type: 'rerequest' });
  };

  const handleFacebookLogout = () => {
    if (!window.FB) {
        toast({ variant: "destructive", title: "SDK do Facebook não carregado."});
        return;
    }
    window.FB.getLoginStatus(async (response: any) => {
        const logoutOnServer = async () => {
            const authResponse = await disconnectService('facebook');
            if (authResponse.success) {
                updateIntegrationStatus('facebook', false);
                updateIntegrationStatus('instagram', false);
                localStorage.removeItem('fb_access_token');
            } else {
                toast({ variant: 'destructive', title: 'Falha no Servidor', description: authResponse.message });
            }
        };

        if (response.status === 'connected') {
            window.FB.logout(logoutOnServer);
        } else {
            // Already logged out on FB side, just log out on our server
            await logoutOnServer();
        }
    });
  };

  const handleToggleIntegration = async (integration: Integration) => {
    const isConnected = integrations[integration];

    if (integration === 'facebook' || integration === 'instagram') {
        if (isConnected) {
            handleFacebookLogout();
        } else {
            handleFacebookLogin();
        }
        return;
    }
    
    if (isConnected) {
        const response = await disconnectService(integration);
        if (response.success) {
            updateIntegrationStatus(integration, false);
        } else {
            toast({ variant: 'destructive', title: 'Falha ao Desconectar', description: response.message });
        }
    } else {
       const response = await connectService(integration);
       if (response.success) {
           updateIntegrationStatus(integration, true);
       } else {
            toast({ variant: 'destructive', title: 'Falha ao Conectar', description: response.message });
       }
    }
  };

  const IntegrationCard = ({
    platform,
    icon: Icon,
    color,
    description,
    isConnected,
  }: {
    platform: Integration;
    icon: React.ElementType;
    color: string;
    description: string;
    isConnected: boolean;
  }) => {
    
    if (platform === 'twitter') {
        return (
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Icon className={`h-8 w-8 ${color}`} />
                        <div>
                            <h3 className="font-semibold capitalize">{platform}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {isClient && (
                        isConnected ? (
                            <Button variant="destructive" onClick={() => handleToggleIntegration('twitter')}>
                                <LogOut className="mr-2 h-4 w-4" /> Desconectar
                            </Button>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default"><LogIn className="mr-2 h-4 w-4" /> Conectar</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Conectar ao Twitter</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Isto irá simular uma conexão com o Twitter usando as credenciais do seu ambiente. A integração completa com OAuth 2.0 requer configuração de backend.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleToggleIntegration('twitter')}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )
                    )}
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <h3 className="font-semibold capitalize">{platform}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {isClient && (
               <Button
                  variant={isConnected ? "destructive" : "default"}
                  onClick={() => handleToggleIntegration(platform)}
                >
                  {isConnected ? <LogOut className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {isConnected ? "Desconectar" : "Conectar"}
                </Button>
            )}
          </div>
        </Card>
      );
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Integrações de Plataformas</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Conectar Contas</CardTitle>
          <CardDescription>
            Gerencie as conexões com redes sociais e serviços de pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <IntegrationCard
            platform="facebook"
            icon={Facebook}
            color="text-[#1877F2]"
            description="Conecte sua página para posts e login."
            isConnected={integrations.facebook}
          />
           <IntegrationCard
            platform="instagram"
            icon={Instagram}
            color="text-[#E4405F]"
            description="Importe sua galeria de fotos e login."
            isConnected={integrations.instagram}
          />
          <IntegrationCard
            platform="twitter"
            icon={Twitter}
            color="text-[#1DA1F2]"
            description="Sincronize seu feed de vídeos e login."
            isConnected={integrations.twitter}
          />
           <IntegrationCard
            platform="paypal"
            icon={PayPalIcon}
            color="text-[#0070BA]"
            description="Conecte para processar pagamentos e login."
            isConnected={integrations.paypal}
          />
           <IntegrationCard
            platform="mercadopago"
            icon={MercadoPagoIcon}
            color="text-[#00B1EA]"
            description="Habilite o checkout do Mercado Pago e login."
            isConnected={integrations.mercadopago}
          />
        </CardContent>
      </Card>
    </>
  );
}

    
