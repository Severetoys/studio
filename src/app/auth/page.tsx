
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const FaceIdIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M4 8V6a2 2 0 0 1 2-2h2" />
        <path d="M4 16v2a2 2 0 0 0 2 2h2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
        <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
    </svg>
);

export default function AuthPage() {
  const router = useRouter();
  
  const handleFaceIdClick = () => {
    router.push('/old-auth-page'); 
  };
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background font-sans relative isolate">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <Card className="w-full max-w-sm shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-500">
            <CardHeader className="text-center pb-4 relative">
            <Button variant="ghost" size="icon" className="absolute top-4 left-4 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => router.push('/')}>
              <ArrowLeft />
            </Button>
            <div className="flex justify-center items-center mb-2 pt-8">
                <FaceIdIcon className="h-16 w-16 text-primary text-shadow-neon-red" />
            </div>
             <CardTitle className="text-2xl font-bold text-shadow-neon-red-light">Autenticação Facial</CardTitle>
            <CardDescription className="text-muted-foreground">
              Clique abaixo para iniciar a verificação.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 px-6 pb-6">
                <Button 
                  onClick={handleFaceIdClick} 
                  className="w-full h-14 bg-primary/90 hover:bg-primary text-primary-foreground text-xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
                >
                  Iniciar Verificação
                </Button>
            </CardContent>
        </Card>
    </main>
  );
}
