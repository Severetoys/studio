
"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

declare global {
  interface Screen {
    isCaptured: boolean;
  }
}

export default function ScreenProtector() {
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    // Verifica se a API está disponível no navegador
    if (typeof window !== 'undefined' && 'screen' in window && 'isCaptured' in window.screen) {
      
      const screen = window.screen;

      // Define o estado inicial
      setIsCaptured(screen.isCaptured);

      // Adiciona um listener para o evento 'capturechange'
      const handleChange = () => {
        setIsCaptured(screen.isCaptured);
      };
      
      screen.addEventListener('capturechange', handleChange);

      // Limpa o listener quando o componente é desmontado
      return () => {
        screen.removeEventListener('capturechange', handleChange);
      };
    }
  }, []);

  if (!isCaptured) {
    return null; // Não renderiza nada se a tela não estiver sendo gravada
  }

  // Renderiza a sobreposição se a tela estiver sendo gravada
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 p-8 text-center text-white">
      <ShieldAlert className="h-24 w-24 text-primary mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold">Gravação de Tela Detectada</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Para proteger o conteúdo, a visualização é desativada durante a gravação da tela.
      </p>
      <p className="mt-2 text-md text-muted-foreground">
        Por favor, pare a gravação para continuar.
      </p>
    </div>
  );
}
