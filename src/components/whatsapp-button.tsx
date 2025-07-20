
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, X, BadgeCheck, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M16.75 13.96c.25.13.41.2.52.32.11.12.16.28.16.48s-.05.38-.15.48c-.1.1-.26.16-.48.16h-.1c-.39 0-1.02-.16-1.89-.55s-1.55-.99-2.06-1.62c-.51-.64-.85-1.39-1-2.24l-.16-2.5.1-.05c.18-.08.35-.12.51-.12.12 0 .23.02.34.07.1.05.2.13.28.23l.1.12c.1.14.15.28.15.43 0 .09-.01.19-.04.3l-.28.98c-.08.28-.12.51-.12.68 0 .2.04.38.12.51l.13.2c.18.25.41.44.68.58l.26.13zm5.1-6.1c-.28-.5-.63-.94-1.03-1.33-.4-.39-.84-.71-1.33-1s-.98-.48-1.5-.66C17.5.7 16.95.58 16.4.58c-1.35 0-2.6.4-3.75 1.18s-2.11 1.8-2.83 3.05c-.73 1.25-1.1 2.6-1.1 3.96 0 1.28.32 2.53.95 3.75l-1.06 3.86.13.13c.2.18.43.33.68.45.25.12.5.2.75.25l3.86-1.06c1.18.55 2.4.83 3.65.83h.1c1.36 0 2.65-.36 3.83-1.08 1.18-.72 2.15-1.68 2.85-2.86.7-1.18 1.08-2.45 1.08-3.81 0-1.1-.18-2.18-.53-3.23z" />
    </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M21.8,3.2c-0.4-0.3-0.9-0.4-1.4-0.1L3.9,8.6C3.4,8.8,3,9.3,3,9.8s0.4,1,0.9,1.2l4.9,1.6l1.6,4.9c0.2,0.5,0.7,0.9,1.2,0.9c0.1,0,0.2,0,0.3,0c0.5-0.1,0.9-0.4,1.1-0.8l5.5-16.5C22.2,4.1,22.1,3.5,21.8,3.2z M17.2,7.2L11,13.4l-3.3-1.1L17.2,7.2z M10.1,16.2l-1.1-3.3l6.2-6.2L10.1,16.2z" />
    </svg>
);

interface ContactButtonProps {
    href: string;
    bgColor: string;
    text: string;
    Icon: React.ElementType;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    isLink: boolean;
}

const ContactButton = ({ href, bgColor, text, Icon, onClick, isLink }: ContactButtonProps) => {
    const commonProps = {
        className: "flex items-center justify-end gap-3 group animate-in fade-in-0 slide-in-from-bottom-5 cursor-pointer",
        "aria-label": text,
    };

    const content = (
        <>
            <div className="bg-background/80 backdrop-blur-sm text-foreground rounded-lg px-4 h-12 flex items-center shadow-lg">
                <span className="text-base font-semibold">{text}</span>
            </div>
            <div className={cn("flex items-center justify-center text-white rounded-full h-14 w-14 shadow-lg", bgColor)}>
                 <Icon className="h-8 w-8" />
            </div>
        </>
    );

    if (isLink) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
                {content}
            </a>
        );
    }

    return (
        <div onClick={onClick} {...commonProps}>
            {content}
        </div>
    );
};


export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Substitua '5511999999999' pelo seu número de telefone completo com código do país e DDD.
  const phoneNumber = "5511999999999"; 
  const message = "Olá! Gostaria de mais informações.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleChatSecretoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push('/chat-secreto');
    setIsOpen(false);
  };
  
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isOpen && (
            <div className="flex flex-col items-end gap-4 transition-all duration-300">
                <ContactButton
                    href="/chat-secreto"
                    bgColor="bg-primary"
                    text="Chat Secreto"
                    Icon={TelegramIcon}
                    onClick={handleChatSecretoClick}
                    isLink={false}
                />
                <ContactButton
                    href={whatsappUrl}
                    bgColor="bg-green-500"
                    text="WhatsApp Business"
                    Icon={WhatsAppIcon}
                    isLink={true}
                />
            </div>
        )}

        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300",
                "bg-green-500 hover:bg-green-600"
            )}
            aria-label={isOpen ? "Fechar opções de chat" : "Abrir opções de chat"}
        >
            {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
            {!isOpen && <BadgeCheck className="absolute top-0 right-0 h-6 w-6 text-blue-400 fill-white" />}
        </button>
    </div>
  );
}
