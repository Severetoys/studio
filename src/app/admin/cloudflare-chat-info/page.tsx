
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Copy, Loader2, Info, ExternalLink, Twitter, Instagram } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCloudflareChatInfo, generateAuthTokenAction } from './actions';
import Link from 'next/link';

// Custom SVG Icons
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.47.15.9.05 1.15-.11.26-1.12.78-1.53.88-.41.1-1.07.15-1.59-.09-.52-.24-1.22-.62-2.22-1.32-.99-.7-1.95-1.95-2.1-2.28-.15-.33-.04-.6.12-.78.16-.18.35-.28.49-.41.13-.13.2-.23.3-.39.09-.16.05-.31-.05-.42-.1-.11-.47-.58-.62-.77-.15-.19-.3-.21-.45-.21-.15 0-.3.02-.43.04-.13.02-.3.04-.5.21-.2.17-.4.37-.54.6-.14.23-.28.49-.28.78s.09.87.14 1.02c.05.15.37 1.13 1.39 2.13 1.02 1 2.23 1.63 3.48 1.8.25.03.75.02 1.22-.17.47-.19.98-.58 1.12-.9.14-.32.14-.62.11-.93-.03-.31-.1-.36-.2-.42s-.21-.09-.46-.15c-.25-.06-.87-.43-1-.49s-.21-.09-.31.09-.37.49-.46.58c-.09.09-.18.11-.31.06-.13-.05-1.07-.37-2.04-1.22-.97-.85-1.63-1.9-1.77-2.23-.14-.33-.02-.51.11-.65.13-.14.28-.35.42-.49.14-.14.19-.28.28-.46.09-.18.05-.37-.05-.49-.1-.12-.87-1.05-1.19-1.41-.32-.36-.65-.31-.87-.31-.2 0-.46.03-.68.05-.22.02-.58.07-.85.33-.27.26-.43.62-.43 1.01 0 .39.14.77.28 1.05.14.28.92 2.37 2.76 4.21 1.84 1.84 3.73 2.95 5.56 3.23.28.04.88.04 1.48-.15.6-.19 1.55-1.01 1.77-1.57.22-.56.22-1.04.16-1.19s-.14-.21-.31-.28c-.17-.07-.43-.14-.68-.21z"/></svg>
);

const GrindrIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v8h-2v-8zm0 10h2v2h-2v-2z" transform="rotate(45 12 12)"/></svg>
);

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.51 5-1.35l3.65 1.82c.5.25 1.08-.25 1.08-.82V12c0-5.52-4.48-10-10-10zm-2.5 11.5L8 12l4-4 1.5 1.5L11.5 11H15v2h-3.5l2 2-1.5 1.5z"/></svg>
);


export default function ExternalCommsPage() {
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
    
    const communicationPlatforms = [
        { name: "WhatsApp Web", href: "https://web.whatsapp.com/", icon: WhatsAppIcon, color: "text-green-500" },
        { name: "Grindr Web", href: "https://web.grindr.com/", icon: GrindrIcon, color: "text-yellow-500" },
        { name: "Messenger", href: "https://www.messenger.com/", icon: MessengerIcon, color: "text-blue-500" },
        { name: "Instagram", href: "https://www.instagram.com/", icon: Instagram, color: "text-pink-500" },
        { name: "Twitter / X", href: "https://twitter.com/", icon: Twitter, color: "text-sky-500" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-lg font-semibold md:text-2xl">Comunicação Externa</h1>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Plataformas de Comunicação
                    </CardTitle>
                    <CardDescription>
                        Acesse rapidamente as versões web das principais plataformas de chat e redes sociais.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {communicationPlatforms.map((platform) => (
                        <Button key={platform.name} asChild variant="outline" className="h-14 justify-start text-base">
                            <Link href={platform.href} target="_blank" rel="noopener noreferrer">
                                <platform.icon className={`h-6 w-6 mr-3 ${platform.color}`} />
                                {platform.name}
                                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                            </Link>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-6 w-6" />
                        Credenciais do Chat Externo (Cloudflare)
                    </CardTitle>
                    <CardDescription>
                        Visualização das credenciais para o widget de chat do site, armazenadas de forma segura no servidor.
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

    