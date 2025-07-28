"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// This page has been deprecated as per the user's request.
// The Facebook login functionality was moved to the admin panel.
// This component is now kept minimal to avoid breaking any old links.

export default function OldAuthPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
       <Card className="w-full max-w-md text-center animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
           <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-primary" onClick={() => router.push('/')}>
            <ArrowLeft />
          </Button>
          <CardTitle className="text-3xl text-shadow-neon-red-light pt-8">
            Página Desativada
          </CardTitle>
          <CardDescription>
            Esta forma de autenticação foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Por favor, retorne à página inicial para acessar as opções de login atuais.
          </p>
        </CardContent>
         <CardFooter>
            <Button onClick={() => router.push('/')} className="w-full">
                Voltar à Página Inicial
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
