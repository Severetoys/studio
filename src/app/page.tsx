
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';
import PaymentButtons from '@/components/payment-buttons';

const features = [
    "Conteúdo exclusivo e sem censura.",
    "Acesso a vídeos e ensaios completos.",
    "Atualizações semanais com novas produções.",
    "Comunidade e interação direta.",
];

const FeatureList = () => (
    <div className="relative w-full overflow-hidden bg-background py-4">
        <div className="flex animate-marquee whitespace-nowrap">
            {features.map((feature, index) => (
                <span key={index} className="flex items-center mx-4 text-muted-foreground text-lg">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
            {features.map((feature, index) => (
                 <span key={`dup-${index}`} className="flex items-center mx-4 text-muted-foreground text-lg" aria-hidden="true">
                    <CheckCircle className="h-5 w-5 mr-3 text-primary" />
                    {feature}
                </span>
            ))}
        </div>
    </div>
);


export default function HomePageContent() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <div className="p-4 md:p-8 bg-background flex flex-col items-center gap-6 w-full max-w-md text-center">
        <Button 
            className="w-full h-20 bg-primary/90 hover:bg-primary text-primary-foreground text-3xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
            onClick={() => router.push('/auth')}>
            <Fingerprint className="h-12 w-12 mr-4" />
            Face ID
        </Button>
        
        <PaymentButtons amount="99.00" />
        
        <Separator className="w-full bg-border/30" />

        <div className="text-center">
            <div className="flex justify-center items-baseline gap-2">
                <p className="text-9xl font-bold text-primary tracking-tight animate-pulse-glow">
                    99,00
                </p>
                <span className="text-lg font-medium text-muted-foreground self-end mb-4">BRL</span>
            </div>
        </div>
        
        <Button 
            className="w-full h-14 bg-primary/90 hover:bg-primary text-primary-foreground text-xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
            onClick={() => router.push('/auth')}>
            ENTRAR
        </Button>
      </div>
      <FeatureList />
      <AboutSection />
    </div>
  );
}
    

    














