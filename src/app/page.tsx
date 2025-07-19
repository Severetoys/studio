
"use client";

import { useState } from 'react';
import Layout from '@/components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function HomePage() {
  return (
    <Layout>
      <div className="flex-grow p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Destaques</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card/80 border-primary/20 shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
              <CardHeader>
                <div className="aspect-video relative">
                  <Image 
                    src={`https://placehold.co/600x400.png`} 
                    alt={`Placeholder image ${i + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-lg"
                    data-ai-hint="model photo"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg">Conteúdo Exclusivo {i + 1}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">Uma breve descrição do conteúdo em destaque.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
