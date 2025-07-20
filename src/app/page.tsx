
"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import AboutSection from '@/components/about-section';

const GPayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="24" viewBox="0 0 60 24">
      <path d="M59.23,10.2h-1.2v1.5h1.2c1.1,0,1.8-0.7,1.8-1.7C61,10.9,60.33,10.2,59.23,10.2z M58.03,13.2h-2.8v-6h3.4 c1.6,0,2.6,1.1,2.6,2.7C61.23,11.8,60.13,13.2,58.03,13.2z M51.73,7.2h-2.1l-2.3,6h2.2l0.4-1.2h2.2l0.2,1.2h2.1L51.73,7.2z M50.03,11l0.7-2.1l0.7,2.1H50.03z M43.43,13.2h-1.9V8.6l-1.6-1.4v6h-1.4v-6l-1.6-1.4v6h-1.4v-6.9h2.2l2.3,2.1l2.3-2.1h2.2V13.2z M31.63,13.2h-2.1V7.2h2.1V13.2z M25.83,12.3c0.9,0.9,2.4,0.7,3.1-0.2c0.1-0.1,0.1-0.2,0.2-0.3V7.2h-2.1v2.9c0,0.6-0.5,1.1-1.1,1.1 s-1.1-0.5-1.1-1.1V7.2h-2.1v3.2C22.73,12,24.33,13.2,25.83,12.3z M14.13,13.2h-2.1l-2.3,6h2.2l0.4-1.2h2.2l0.2,1.2h2.1 L14.13,7.2z M12.43,11l0.7-2.1l0.7,2.1H12.43z M9.23,7.2l-2.3,6h2.2l0.4-1.2h2.2l0.2,1.2h2.1l-2.3-6H9.23z M9.13,11l0.7-2.1 l0.7,2.1H9.13z M5.53,8.9C5.13,8.5,4.53,8.2,3.83,8.2c-1.3,0-2.2,1-2.2,2.4c0,1.4,0.9,2.4,2.3,2.4c0.8,0,1.5-0.4,1.9-1h-1.2 c-0.4,0.3-0.7,0.5-1,0.5c-0.6,0-1-0.5-1-1.4c0-0.9,0.5-1.4,1-1.4c0.3,0,0.6,0.2,0.7,0.4H5.53z" fill="#fff"/>
      <path d="M25.83,12.3c0.9,0.9,2.4,0.7,3.1-0.2c0.1-0.1,0.1-0.2,0.2-0.3V7.2h-2.1v2.9c0,0.6-0.5,1.1-1.1,1.1c-0.6,0-1.1-0.5-1.1-1.1V7.2h-2.1v3.2C22.73,12,24.33,13.2,25.83,12.3z" fill="#fff"/>
      <path d="M9.6,2.7c-1.6-1.5-3.8-2.4-6.2-2.4C1.5,0.3,0,1.6,0,3.4c0,1.5,1,2.8,2.4,3.1c1.8,0.4,3.6-0.2,4.9-1.5 c1-1,1.5-2.2,1.5-3.4C8.8,1.2,9,0.8,9.6,2.7z" fill="#FDBA2A"/>
      <path d="M9.6,2.7C8.1,1,6.3,0.1,4.4,0c-1.6,1.6-2.3,3.7-1.8,5.8C3.5,5.5,4.3,5.1,5,4.8c1.5-0.6,2.3-2.1,1.9-3.5 C6.7,1,7.1,0.7,7.5,0.5C8.2,1.2,8.9,1.9,9.6,2.7z" fill="#F6851F"/>
      <path d="M4.4,0C2.5,0.1,0.6,1.1,2.1,2.7c-0.4,1.4,0.4,2.9,1.9,3.5c0.7,0.3,1.5,0.7,2.4,1C7.3,5.4,8.1,3.4,7.5,1.4 C7.1,0.7,6.7,1,6.9,1.3C6.4,0.8,5.5,0.3,4.4,0z" fill="#EA4335"/>
      <path d="M2.6,8C1.7,7.1,1,5.8,1,4.5C1,3.6,1.2,2.8,1.6,2.1c-0.6,1.1-0.7,2.4-0.2,3.6c0.4,1,1.2,1.8,2.2,2.2 C3.3,7.9,2.9,7.9,2.6,8z" fill="#4285F4"/>
    </svg>
);

const ApplePayIcon = () => (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.2825 5.17498C13.6825 5.14498 15.2425 4.19998 16.3225 3.20998C15.5125 2.19998 14.2825 1.63498 13.0225 1.63498C10.5325 1.63498 8.5225 3.32998 8.5225 5.75998C8.5225 7.55998 9.7225 8.39998 11.0425 8.39998C12.3025 8.39998 12.9325 7.61998 14.2225 7.58998C14.2225 7.58998 12.9625 9.77998 11.1325 11.64C9.9325 12.87 9.0925 14.63 9.0925 16.5H10.5925C10.5925 14.93 11.2225 13.56 12.3025 12.48C13.3825 11.43 14.4325 9.92998 14.4325 9.89998C14.3725 9.89998 12.9925 9.17998 12.9925 7.43998C12.9925 7.43998 14.3125 6.62998 15.8425 6.62998C16.2925 6.62998 18.0025 6.80998 19.0525 5.39998C18.0625 3.53998 16.1425 2.84998 15.1525 2.75998C13.5925 2.60998 11.9725 3.32998 11.1325 3.32998C11.1325 3.32998 11.5825 1.70998 13.0525 0.53998C11.6425 0.0599805 10.0525 0 8.5825 0C6.0025 0 3.7525 1.52998 2.5825 3.89998C0.00250049 8.87998 3.8725 14.34 6.7825 16.5C7.9225 17.37 9.1225 18.39 10.6525 18.42C12.0325 18.42 12.5725 17.76 14.1925 17.76C15.8125 17.76 16.4125 18.42 17.8225 18.39C19.2325 18.36 20.2525 17.25 20.8825 16.26C21.4225 15.42 21.6025 14.61 21.6325 14.58C21.5725 14.58 19.3525 13.65 19.3525 11.1C19.3525 8.96998 21.0325 7.76998 21.3325 7.55998C19.9525 6.35998 18.1525 5.81998 17.4325 5.66998C15.8725 5.33998 14.5525 6.17998 14.2225 6.17998C14.2225 6.17998 13.0525 5.20498 12.2825 5.17498Z" fill="black"></path>
        <path d="M28.455 12.245C28.455 11.135 29.115 10.595 30.305 10.595C31.525 10.595 32.125 11.165 32.125 12.125C32.125 12.775 31.845 13.145 31.065 13.435L32.415 16.5H30.825L29.745 13.775H29.565V16.5H28.455V12.245ZM29.565 12.875H30.015C30.675 12.875 31.065 12.575 31.065 12.155C31.065 11.705 30.675 11.465 30.045 11.465C29.415 11.465 29.565 11.705 29.565 12.155V12.875Z" fill="black"></path>
        <path d="M37.7949 16.5V11.465C37.7949 10.975 37.5449 10.655 37.0049 10.595L37.1549 9.875C37.3649 9.905 37.5749 9.935 37.7949 9.935V10.565H38.7849V9.935C39.2649 9.935 39.7149 9.755 39.7149 9.155C39.7149 8.635 39.2949 8.455 38.7849 8.455V7.825H39.7149V6.835H37.7949V6.205C37.5749 6.205 37.3649 6.235 37.1549 6.265L37.0049 5.545C37.5449 5.485 37.7949 5.165 37.7949 4.675V0H33.5049V16.5H34.6149V9.065C34.6149 7.825 35.1549 7.225 36.1449 7.225C37.1349 7.225 37.6449 7.825 37.6449 9.065V16.5H38.7849H42.7149V11.465C42.7149 10.975 42.4649 10.655 41.9249 10.595L42.0749 9.875C42.2849 9.905 42.4949 9.935 42.7149 9.935V10.565H43.7049V9.935C44.1849 9.935 44.6349 9.755 44.6349 9.155C44.6349 8.635 44.2149 8.455 43.7049 8.455V7.825H44.6349V6.835H42.7149V6.205C42.4949 6.205 42.2849 6.235 42.0749 6.265L41.9249 5.545C42.4649 5.485 42.7149 5.165 42.7149 4.675V0H38.9349V16.5H37.7949Z" fill="black"></path>
    </svg>
);


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

  const handlePaymentClick = (method: 'gpay' | 'applepay') => {
    console.log(`Initiating payment with ${method}`);
    router.push('/auth'); 
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="p-4 md:p-8 bg-background flex flex-col items-center gap-6 w-full max-w-md text-center">
        <Button 
            className="w-full h-20 bg-primary/90 hover:bg-primary text-primary-foreground text-3xl font-semibold shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300"
            onClick={() => router.push('/auth')}>
            <Fingerprint className="h-12 w-12 mr-4" />
            Face ID
        </Button>
        
        <div className="w-full grid grid-cols-2 gap-4">
            <Button onClick={() => handlePaymentClick('gpay')} variant="secondary" className="h-12 flex items-center justify-center bg-black text-white border border-zinc-700 hover:bg-zinc-800 transition-all duration-300">
                <GPayIcon />
            </Button>
            <Button onClick={() => handlePaymentClick('applepay')} variant="secondary" className="h-12 bg-white text-black border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 transition-all duration-300">
                <ApplePayIcon />
            </Button>
        </div>
        
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
    

    












