
"use client";

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function WhatsAppButton() {
  const pathname = usePathname();
  const whatsappUrl = `https://wa.me/italosantos`;
  
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 group",
        )}
        aria-label="Fale conosco no WhatsApp"
    >
         <div className="order-1 text-lg font-bold text-yellow-300 animate-pulse-gold-glow">
            WHATSAPP
        </div>
        <div
            className={cn(
                "relative h-16 w-16 transition-all duration-300 order-2 animate-pulse-green-glow rounded-full"
            )}
        >
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/Assunto%204.png?alt=media&token=ea0eded0-3335-4a34-8a58-1247ad7c8e65" 
                alt="WhatsApp"
                width={64}
                height={64}
                className="object-contain transition-transform duration-300 group-hover:scale-110"
            />
        </div>
    </a>
  );
}
