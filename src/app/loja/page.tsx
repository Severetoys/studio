
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function LojaPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light">
            Loja On-line
          </CardTitle>
           <CardDescription className="text-muted-foreground pt-2">
            Conecte suas redes sociais para uma experiência integrada.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6 p-10 min-h-[300px]">
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
            <Button variant="outline" className="w-full h-14 text-lg border-primary/30 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
              <Instagram className="mr-3 h-6 w-6" />
              Conectar com Instagram
            </Button>
          </Link>
          <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-full max-w-xs">
            <Button variant="outline" className="w-full h-14 text-lg border-primary/30 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
              <Facebook className="mr-3 h-6 w-6" />
              Conectar com Facebook
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
