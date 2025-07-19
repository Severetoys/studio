"use client";

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '@/components/layout/layout';

function formatSlug(slug: string) {
    return slug
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function FetishPage() {
    const params = useParams();
    const slug = params.slug as string;
    const title = slug ? formatSlug(slug) : "Carregando...";

    return (
        <Layout>
            <div className="container mx-auto p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                        <CardDescription>Informações e detalhes sobre este fetiche.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>
                            O conteúdo para a página <strong>{title}</strong> será adicionado aqui. Este é um placeholder para o conteúdo informativo que você irá criar.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
