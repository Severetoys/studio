
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram, Twitter } from "lucide-react";

type Integration = "twitter" | "instagram" | "facebook";

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState({
    twitter: false,
    instagram: false,
    facebook: false,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = {
        twitter: localStorage.getItem("integration_twitter") === "true",
        instagram: localStorage.getItem("integration_instagram") === "true",
        facebook: localStorage.getItem("integration_facebook") === "true",
      };
      setIntegrations(savedState);
    } catch (error) {
      console.error("Failed to access localStorage", error);
    }
  }, []);

  const handleSwitchChange = (integration: Integration, checked: boolean) => {
    setIntegrations(prevState => {
      const newState = { ...prevState, [integration]: checked };
      try {
        localStorage.setItem(`integration_${integration}`, String(checked));
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
      return newState;
    });
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
  }) => (
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
          <div className="flex items-center gap-2">
            <Label htmlFor={`${platform}-switch`} className="text-sm text-muted-foreground">
              Desconectado
            </Label>
            <Switch
              id={`${platform}-switch`}
              checked={isConnected}
              onCheckedChange={(checked) => handleSwitchChange(platform, checked)}
              aria-label={`Toggle ${platform} integration`}
            />
            <Label htmlFor={`${platform}-switch`} className="text-sm font-medium">
              Conectado
            </Label>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Integrações de Redes Sociais</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Conectar Contas</CardTitle>
          <CardDescription>
            Gerencie a conexão com suas redes sociais para sincronizar conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <IntegrationCard
            platform="twitter"
            icon={Twitter}
            color="text-[#1DA1F2]"
            description="Sincronize seu feed de vídeos."
            isConnected={integrations.twitter}
          />
          <IntegrationCard
            platform="instagram"
            icon={Instagram}
            color="text-[#E4405F]"
            description="Importe sua galeria de fotos."
            isConnected={integrations.instagram}
          />
          <IntegrationCard
            platform="facebook"
            icon={Facebook}
            color="text-[#1877F2]"
            description="Conecte sua página para posts."
            isConnected={integrations.facebook}
          />
        </CardContent>
      </Card>
    </>
  );
}
