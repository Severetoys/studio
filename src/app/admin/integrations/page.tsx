
"use client";

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


export default function AdminIntegrationsPage() {
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
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Twitter className="h-8 w-8 text-[#1DA1F2]" />
                        <div>
                            <h3 className="font-semibold">Twitter / X</h3>
                            <p className="text-sm text-muted-foreground">Sincronize seu feed de vídeos.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Label htmlFor="twitter-switch" className="text-sm text-muted-foreground">Desconectado</Label>
                         <Switch id="twitter-switch" />
                         <Label htmlFor="twitter-switch" className="text-sm font-medium">Conectado</Label>
                    </div>
                </div>
            </Card>
             <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Instagram className="h-8 w-8 text-[#E4405F]" />
                        <div>
                            <h3 className="font-semibold">Instagram</h3>
                            <p className="text-sm text-muted-foreground">Importe sua galeria de fotos.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                         <Label htmlFor="instagram-switch" className="text-sm text-muted-foreground">Desconectado</Label>
                         <Switch id="instagram-switch" />
                         <Label htmlFor="instagram-switch" className="text-sm font-medium">Conectado</Label>
                    </div>
                </div>
            </Card>
             <Card className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Facebook className="h-8 w-8 text-[#1877F2]" />
                        <div>
                            <h3 className="font-semibold">Facebook</h3>
                            <p className="text-sm text-muted-foreground">Conecte sua página para posts.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Label htmlFor="facebook-switch" className="text-sm text-muted-foreground">Desconectado</Label>
                         <Switch id="facebook-switch" />
                         <Label htmlFor="facebook-switch" className="text-sm font-medium">Conectado</Label>
                    </div>
                </div>
            </Card>
        </CardContent>
      </Card>
    </>
  );
}
