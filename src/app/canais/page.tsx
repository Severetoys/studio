
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CanaisPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center">
            Canais
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <p className="text-muted-foreground">Conteúdo dos canais em breve.</p>
        </CardContent>
      </Card>
    </main>
  );
}
