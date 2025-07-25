"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Copy, Loader2, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Esta é uma função de servidor simulada. Em um cenário real, 
// ela estaria em um arquivo 'actions.ts' e chamaria a API da Cloudflare.
async function getCloudflareChatInfo(): Promise<{ orgId: string | undefined }> {
    "use server";
    // As variáveis de ambiente só são acessíveis no servidor.
    return {
        orgId: process.env.CLOUDFLARE_ORG_ID
    };
}

async function generateAuthTokenAction(userId: string): Promise<string> {
    "use server";
    // Em um cenário real, aqui você usaria o ORG_ID e a API_KEY para chamar
    // a API da Cloudflare e gerar um token de autenticação para o `userId`.
    console.log(`Gerando token para o usuário: ${userId}`);
    // Simulando a geração de um token
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return `dummy_token_for_${userId}_${Math.random().toString(36).substring(2, 10)}`;
}


export default function CloudflareChatInfoPage() {
    const { toast } = useToast();
    const [orgId, setOrgId] = useState<string | undefined>('');
    const [userId, setUserId] = useState('user-1234');
    const [authToken, setAuthToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useState(() => {
        getCloudflareChatInfo().then(info => setOrgId(info.orgId));
    });

    const handleGenerateToken = async () => {
        if (!userId) {
            toast({ variant: 'destructive', title: 'ID do Usuário necessário' });
            return;
        }
        setIsLoading(true);
        setAuthToken('');
        try {
            const token = await generateAuthTokenAction(userId);
            setAuthToken(token);
            toast({ title: 'Token de autenticação gerado!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Falha ao gerar token' });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copiado para a área de transferência!" });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-6 w-6" />
                        Credenciais do Chat Cloudflare
                    </CardTitle>
                    <CardDescription>
                        Visualização das credenciais armazenadas de forma segura no servidor.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Informação de Segurança</AlertTitle>
                        <AlertDescription>
                            Suas chaves de API estão armazenadas de forma segura no servidor e nunca são expostas ao frontend.
                        </AlertDescription>
                    </Alert>
                    <div>
                        <Label htmlFor="orgId">Organization ID</Label>
                        <div className="flex items-center gap-2">
                            <Input id="orgId" value={orgId || "Carregando..."} readOnly className="font-mono"/>
                            <Button variant="outline" size="icon" onClick={() => orgId && copyToClipboard(orgId)} disabled={!orgId}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Gerador de Token de Autenticação (Simulação)</CardTitle>
                    <CardDescription>
                        Simule a geração de um `authToken` para um cliente do SDK, como seria feito no backend.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="userId">ID do Usuário para gerar o token</Label>
                        <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Ex: user-1234"/>
                    </div>
                    <Button onClick={handleGenerateToken} disabled={isLoading || !userId}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Gerando...' : 'Gerar Auth Token'}
                    </Button>
                     {authToken && (
                        <div>
                            <Label htmlFor="authToken">Auth Token Gerado</Label>
                            <div className="flex items-center gap-2">
                                <Input id="authToken" value={authToken} readOnly className="font-mono text-green-500"/>
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(authToken)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
