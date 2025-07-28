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
        <path d="M12,2C6.486,2,2,6.486,2,12c0,1.78,0.463,3.442,1.25,4.922L2.046,22l5.33-1.426 C8.83,21.543,10.387,22,12,22c5.514,0,10-4.486,10-10S17.514,2,12,2z M16.487,15.123c-0.129,0.347-0.781,0.64-1.074,0.677 c-0.289,0.035-0.613,0.04-0.908-0.091c-0.293-0.13-0.656-0.271-1.127-0.543c-0.832-0.479-1.543-1.1-2.115-1.821 c-0.574-0.721-0.957-1.539-1.112-2.311c-0.157-0.771,0.038-1.424,0.219-1.996l0.119-0.375c0.121-0.375,0.18-0.732,0.088-1.059 c-0.092-0.329-0.211-0.482-0.34-0.596c-0.129-0.115-0.283-0.179-0.452-0.188l-0.523-0.016c-0.23,0-0.443,0.018-0.633,0.053 c-0.19,0.035-0.383,0.112-0.559,0.228c-0.176,0.115-0.334,0.266-0.467,0.447c-0.133,0.181-0.231,0.396-0.291,0.633 c-0.06,0.238-0.08,0.5-0.062,0.768c0.018,0.27,0.08,0.558,0.184,0.854c0.105,0.297,0.242,0.615,0.41,0.945 c0.338,0.66,0.814,1.3,1.404,1.887c0.59,0.585,1.258,1.057,1.979,1.393c0.352,0.164,0.711,0.297,1.068,0.395 c0.355,0.096,0.697,0.141,1.016,0.131c0.319-0.008,0.631-0.066,0.926-0.172c0.295-0.105,0.563-0.256,0.793-0.443 c0.229-0.189,0.418-0.41,0.557-0.656c0.139-0.246,0.222-0.506,0.244-0.771c0.021-0.264-0.014-0.514-0.1-0.734 C16.639,15.353,16.559,15.245,16.487,15.123z"></path>
    </svg>
);


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
            <WhatsAppIcon className="h-9 w-9" />
        </div>
    </a>
  );
}
