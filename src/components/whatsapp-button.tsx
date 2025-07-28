
"use client";

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

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


export default function WhatsAppButton() {
  const pathname = usePathname();
  const whatsappUrl = `https://wa.me/italosantos`;
  
  if (pathname.startsWith('/admin') || pathname.startsWith('/chat-secreto')) {
    return null;
  }

  return (
    <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
            "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300",
            "bg-green-500 hover:bg-green-600 animate-pulse-green-glow"
        )}
        aria-label="Fale conosco no WhatsApp"
    >
        <WhatsAppIcon className="h-9 w-9" />
    </a>
  );
}
