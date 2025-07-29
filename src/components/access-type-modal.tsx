
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, User, KeyRound, Lock, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

interface AccessTypeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ADMIN_PASSWORD = "Severe123@";
const ADMIN_EMAIL = "pix@italosantos.com";

export default function AccessTypeModal({ isOpen, onOpenChange }: AccessTypeModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [view, setView] = useState<'selection' | 'adminLogin'>('selection');
    
    // Admin login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const handleAdminLogin = () => {
        setIsLoggingIn(true);
        setError('');

        if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            toast({ title: "Login bem-sucedido!", description: "Bem-vindo ao painel." });
            localStorage.setItem("adminAuthenticated", "true");
            router.push('/admin');
            handleClose();
        } else {
            setError("E-mail ou senha incorretos.");
            toast({ variant: "destructive", title: "Falha na Autenticação" });
            setIsLoggingIn(false);
        }
    };
    
    const handleUserAccess = () => {
        window.open('https://login.italosantos.com', '_blank');
        handleClose();
    }

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after a short delay to allow closing animation
        setTimeout(() => {
            setView('selection');
            setEmail('');
            setPassword('');
            setError('');
            setIsLoggingIn(false);
        }, 300);
    }
    
    const renderSelectionView = () => (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary text-shadow-neon-red-light text-center flex items-center justify-center gap-2">
                    <ShieldCheck /> Tipo de Acesso
                </DialogTitle>
                <DialogDescription className="text-center">
                    Selecione como você deseja acessar o site.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex flex-col gap-4">
                <Button onClick={() => setView('adminLogin')} className="w-full h-12 text-base">
                    <Lock className="mr-2" />
                    Acessar como Administrativo
                </Button>
                <Button onClick={handleUserAccess} variant="secondary" className="w-full h-12 text-base">
                    <User className="mr-2" />
                    Acessar como Usuário
                </Button>
            </div>
        </>
    );
    
    const renderAdminLoginView = () => (
         <>
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary text-shadow-neon-red-light text-center flex items-center justify-center gap-2 relative">
                     <Button variant="ghost" size="icon" className="absolute left-0" onClick={() => setView('selection')}>
                        <ArrowLeft />
                    </Button>
                    <Lock /> Acesso Administrativo
                </DialogTitle>
                <DialogDescription className="text-center">
                    Insira suas credenciais para acessar o painel.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email-admin" className="flex items-center gap-2"><Mail /> Email</Label>
                    <Input
                        id="email-admin"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        placeholder="admin@exemplo.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-admin" className="flex items-center gap-2"><KeyRound /> Senha</Label>
                    <Input
                        id="password-admin"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        placeholder="********"
                    />
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <Button 
                    type="button" 
                    className="w-full h-12 text-base" 
                    onClick={handleAdminLogin} 
                    disabled={isLoggingIn || !email || !password}
                >
                    {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    {isLoggingIn ? 'Verificando...' : 'Entrar'}
                </Button>
            </div>
        </>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
               {view === 'selection' ? renderSelectionView() : renderAdminLoginView()}
            </DialogContent>
        </Dialog>
    );
}
