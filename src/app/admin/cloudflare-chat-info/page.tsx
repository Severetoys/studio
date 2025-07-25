
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Copy, Loader2, Info } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCloudflareChatInfo, generateAuthTokenAction } from './actions';


export default function CloudflareChatInfoPage() {
    const { toast } = useToast();
    const [orgId, setOrgId] = useState<string | undefined>('');
    const [userId, setUserId] = useState('Italo Santos');
    const [authToken, setAuthToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOrgId, setIsLoadingOrgId] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            setIsLoadingOrgId(true);
            const info = await getCloudflareChatInfo();
            setOrgId(info.orgId);
            setIsLoadingOrgId(false);
        };
        fetchInfo();
    }, []);

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
                            <Input id="orgId" value={isLoadingOrgId ? "Carregando..." : (orgId || "Não encontrado")} readOnly className="font-mono"/>
                            <Button variant="outline" size="icon" onClick={() => orgId && copyToClipboard(orgId)} disabled={!orgId || isLoadingOrgId}>
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
                        <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Ex: Italo Santos" readOnly/>
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
