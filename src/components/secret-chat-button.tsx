"use client";

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { X } from 'lucide-react';

const SecretChatIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M21.384,17.425c-0.076,0.229-0.21,0.435-0.388,0.609c-0.21,0.207-0.478,0.36-0.78,0.457 c-0.301,0.096-0.627,0.144-0.965,0.144c-0.443,0-0.864-0.081-1.246-0.232c-0.384-0.152-0.72-0.366-0.999-0.631l-1.95-1.95 c-0.266-0.27-0.475-0.582-0.621-0.925c-0.146-0.344-0.22-0.709-0.22-1.085v-1.203c-0.002-0.41,0.084-0.814,0.252-1.18 c0.17-0.369,0.41-0.686,0.706-0.938l0.55-0.467c0.354-0.299,0.76-0.505,1.196-0.608c0.438-0.101,0.887-0.09,1.32,0.035 l0.551,0.158c0.412,0.118,0.78,0.323,1.08,0.598c0.301,0.277,0.522,0.615,0.65,0.995l0.164,0.482 C21.43,16.828,21.427,17.155,21.384,17.425z" />
        <path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10c0.399,0,0.79-0.04,1.171-0.116C16.277,22.548,22,20.65,22,20.65 l-1.975-2.035C21.2,16.595,22,14.39,22,12C22,6.486,17.514,2,12,2z M18.479,18.917c-0.125,0.021-0.25,0.031-0.375,0.031 c-0.469,0-0.922-0.141-1.309-0.411c-0.389-0.271-0.691-0.62-0.891-1.021l-0.165-0.485c-0.096-0.281-0.266-0.525-0.492-0.713 l-0.552-0.468c-0.225-0.191-0.504-0.325-0.806-0.389c-0.303-0.065-0.615-0.054-0.914,0.029l-0.551,0.158 c-0.309,0.088-0.592,0.24-0.828,0.444l-1.949,1.949c-0.45,0.45-1.061,7.02-1.889,6.568c-0.828-0.451,4.722-1.062,5.172-1.89 c0.449-0.828-0.162-4.722,0.666-5.172c0.825-0.451,5.617,1.436,5.166,2.264C19.531,18.455,18.929,18.868,18.479,18.917z" />
    </svg>
);


interface SecretChatButtonProps {
    onClick: () => void;
    isChatOpen: boolean;
}

export default function SecretChatButton({ onClick, isChatOpen }: SecretChatButtonProps) {
    return (
       <div
            className={cn(
                "fixed bottom-6 left-6 z-[1001] flex flex-col items-center gap-2"
            )}
       >
            <div className="bg-card/90 backdrop-blur-sm border border-primary/50 text-foreground font-semibold px-4 py-2 rounded-full shadow-lg order-1">
                Chat Secreto
            </div>
            <Button
                onClick={onClick}
                aria-label={isChatOpen ? "Fechar Chat Secreto" : "Abrir Chat Secreto"}
                className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 order-2",
                    "bg-primary hover:bg-primary/90 animate-pulse-red-glow"
                )}
            >
                {isChatOpen ? <X className="h-9 w-9" /> : <SecretChatIcon className="h-9 w-9" />}
            </Button>
       </div>
    );
}
