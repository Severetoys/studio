
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function DashboardVideosPage() {
    const router = useRouter();

    return (
        <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-2xl text-center animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                    <CardTitle className="text-3xl text-shadow-neon-red-light">Conteúdo Desbloqueado</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Seu vídeo está pronto para ser assistido.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">(Player de vídeo aparecerá aqui)</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Painel
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
