
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from 'lucide-react';

// Senha simples para o protótipo. Em um app real, use um sistema de autenticação seguro.
const ADMIN_PASSWORD = "admin";

interface AdminLoginPageProps {
  onAuthSuccess: () => void;
}

export default function AdminLoginPage({ onAuthSuccess }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoggingIn(true);
    setError('');

    if (password === ADMIN_PASSWORD) {
      toast({ title: "Login bem-sucedido!", description: "Bem-vindo ao painel." });
      localStorage.setItem("adminAuthenticated", "true");
      onAuthSuccess();
      router.push('/admin'); 
    } else {
      setError("Senha incorreta. Por favor, tente novamente.");
      toast({
        variant: "destructive",
        title: "Falha no Login",
        description: "A senha inserida está incorreta.",
      });
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <Lock className="h-10 w-10 text-primary"/>
          </div>
          <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          <CardDescription>
            Por favor, insira a senha para acessar o painel administrativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="********"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? 'Entrando...' : 'Entrar'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
