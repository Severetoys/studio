
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
import { Facebook, Instagram, Twitter, LogOut, LogIn, Loader2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { connectService, disconnectService, getIntegrationStatus, type Integration } from './actions';


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


export default function AdminIntegrationsPage() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Record<Integration, boolean>>({
    twitter: false,
    instagram: false,
    facebook: false,
    paypal: false,
    mercadopago: false,
  });
  const [isLoading, setIsLoading] = useState<Record<Integration, boolean>>({
    twitter: true,
    instagram: true,
    facebook: true,
    paypal: true,
    mercadopago: true,
  });

  useEffect(() => {
    async function fetchAllStatus() {
        const services: Integration[] = ['twitter', 'instagram', 'facebook', 'paypal', 'mercadopago'];
        
        const statuses = await Promise.all(services.map(async (service) => {
            const status = await getIntegrationStatus(service);
            return { service, status };
        }));
        
        const newIntegrationsState: Record<Integration, boolean> = { ...integrations };
        const newLoadingState: Record<Integration, boolean> = { ...isLoading };
        
        statuses.forEach(({ service, status }) => {
            newIntegrationsState[service] = status;
            newLoadingState[service] = false;
        });

        setIntegrations(newIntegrationsState);
        setIsLoading(newLoadingState);
    }
    fetchAllStatus();
  }, []);

  const handleToggleIntegration = async (integration: Integration) => {
    setIsLoading(prev => ({...prev, [integration]: true }));
    const isConnected = integrations[integration];

    try {
        let result: { success: boolean, message: string };
        if (isConnected) {
            result = await disconnectService(integration);
        } else {
            result = await connectService(integration);
        }

        if (result.success) {
            setIntegrations(prevState => ({ ...prevState, [integration]: !isConnected }));
            toast({
                title: `Integração ${!isConnected ? 'Conectada' : 'Desconectada'}`,
                description: result.message,
            });
        } else {
             toast({
                variant: 'destructive',
                title: `Falha na Operação`,
                description: result.message,
            });
        }

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: `Erro de Servidor`,
            description: error.message,
        });
    } finally {
        setIsLoading(prev => ({...prev, [integration]: false }));
    }
  };

  const IntegrationCard = ({
    platform,
    icon: Icon,
    color,
    description,
  }: {
    platform: Integration;
    icon: React.ElementType;
    color: string;
    description: string;
  }) => {

    const isCardLoading = isLoading[platform];
    const isConnected = integrations[platform];

    const connectButton = (
      <Button 
        variant="default" 
        disabled={isCardLoading}
      >
        {isCardLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
        Conectar
      </Button>
    );

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
              {isCardLoading ? (
                 <Loader2 className="h-5 w-5 animate-spin" />
              ) : isConnected ? (
                <Button 
                    variant="destructive" 
                    onClick={() => handleToggleIntegration(platform)}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                     Desconectar
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    {connectButton}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Conectar ao {platform}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Para uma conexão real, seria necessário um fluxo seguro (OAuth 2.0) para obter suas credenciais de API. Esta ação irá simular a conexão, permitindo que você controle a exibição do feed no seu site.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleToggleIntegration(platform)}>Continuar e Conectar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            }
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
            Gerencie as conexões com redes sociais e serviços de pagamento. O status de conectado/desconectado é salvo no servidor e controla a visibilidade dos feeds no site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <IntegrationCard
            platform="facebook"
            icon={Facebook}
            color="text-[#1877F2]"
            description="Exibir/ocultar catálogo de produtos do Facebook."
          />
           <IntegrationCard
            platform="instagram"
            icon={Instagram}
            color="text-[#E4405F]"
            description="Exibir/ocultar galeria de fotos do Instagram."
          />
          <IntegrationCard
            platform="twitter"
            icon={Twitter}
            color="text-[#1DA1F2]"
            description="Exibir/ocultar feed de vídeos do X (Twitter)."
          />
           <IntegrationCard
            platform="paypal"
            icon={PayPalIcon}
            color="text-[#0070BA]"
            description="Habilitar/desabilitar pagamentos com PayPal."
          />
           <IntegrationCard
            platform="mercadopago"
            icon={MercadoPagoIcon}
            color="text-[#00B1EA]"
            description="Habilitar/desabilitar pagamentos com Mercado Pago."
          />
        </CardContent>
      </Card>
    </>
  );
}
