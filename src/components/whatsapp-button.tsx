
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
            "fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2",
        )}
        aria-label="Fale conosco no WhatsApp"
    >
         <div className="bg-card/90 backdrop-blur-sm border border-green-500/50 text-foreground font-semibold px-4 py-2 rounded-full shadow-lg order-1">
            WhatsApp
        </div>
        <div
            className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 order-2",
                "bg-green-500 hover:bg-green-600 animate-pulse-green-glow"
            )}
        >
            <Image 
                src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/unnamed%20(1).jpg?alt=media&token=2b5f0129-6ac5-4f9e-b4f2-7fbbb90e6d49" 
                alt="WhatsApp"
                width={40}
                height={40}
            />
        </div>
    </a>
  );
}
