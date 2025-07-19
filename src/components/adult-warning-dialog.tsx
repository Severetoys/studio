
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from 'lucide-react';

interface AdultWarningDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export default function AdultWarningDialog({ isOpen, onConfirm }: AdultWarningDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="bg-card border-primary shadow-lg shadow-neon-red-strong">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-primary text-shadow-neon-red" />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-bold text-foreground text-shadow-neon-red-light">
            Aviso de Conteúdo Adulto
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground pt-2">
            Este site contém conteúdo adulto (+18) e é restrito a maiores de idade.
            <br />
            Pressione continuar apenas se você tiver 18 anos ou mais.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onConfirm}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base shadow-neon-red-light hover:shadow-neon-red-strong"
          >
            Tenho 18+ | Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
