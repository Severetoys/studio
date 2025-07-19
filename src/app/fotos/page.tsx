
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FotosPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center">
            Fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-20 min-h-[300px]">
          <p className="text-muted-foreground">Conteúdo para a página de Fotos em breve.</p>
        </CardContent>
      </Card>
    </main>
  );
}
