
"use client";

import { Button } from '@/components/ui/button';
import { Fingerprint, KeyRound } from 'lucide-react';
import { useState } from 'react';
import AuthModal from '@/components/auth-modal';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import FeatureMarquee from '@/components/feature-marquee';
import Image from 'next/image';

export default function Home() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center min-h-screen text-center bg-black text-white p-4 overflow-x-hidden">
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/background-image.jpg')" }} 
            >
                <div className="absolute inset-0 w-full h-full bg-black bg-opacity-60"></div>
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto pt-8">
                <div 
                    className="mb-8 border-4 border-red-500 p-4"
                    style={{ boxShadow: '0 0 15px 5px rgba(255, 0, 0, 0.5)' }}
                >
                    <h1 
                        className="text-8xl md:text-9xl font-bold text-white"
                        style={{ fontFamily: '"Times New Roman", Times, serif' }}
                    >
                        Italo Santos
                    </h1>
                </div>

                <div className="w-full max-w-xs flex flex-col items-center gap-y-6">
                    <Button 
                        className="w-full h-14 text-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transform scale-125 neon-red-glow"
                    >
                        <Fingerprint className="mr-2 h-6 w-6" />
                        Face ID
                    </Button>

                    <div className="flex justify-around items-center w-full px-2">
                         <button className="flex-1 transition-transform hover:scale-105">
                            <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=3a91ba87-6df8-41db-a3bd-64f720e7feb2" alt="Apple Pay" width={100} height={40} className="object-contain" />
                        </button>
                        <button className="flex-1 transition-transform hover:scale-105">
                             <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-25%20at%2021.41.37.jpeg?alt=media&token=4cfc8616-1e75-4eb2-8936-fbae3f2bc649" alt="PIX" width={80} height={40} className="object-contain" />
                        </button>
                        <button className="flex-1 transition-transform hover:scale-105">
                           <Image src="https://firebasestorage.googleapis.com/v0/b/authkit-y9vjx.firebasestorage.app/o/WhatsApp%20Image%202025-07-26%20at%2002.02.58.jpeg?alt=media&token=3a91ba87-6df8-41db-a3bd-64f720e7feb2" alt="Google Pay" width={100} height={40} className="object-contain" />
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-lg">Assinatura Mensal</p>
                        <p className="text-5xl font-bold text-red-500 animate-neon-blink" style={{ transform: 'scale(1.44)' }}>R$ 99,00 <span className="text-lg font-normal text-white">BRL</span></p>
                    </div>

                     <div className="w-full">
                        <PayPalScriptProvider options={{ "clientId": "test" }}>
                            <PayPalButtons style={{ layout: "horizontal", label: "paypal" }} />
                        </PayPalScriptProvider>
                    </div>

                    <Button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full h-14 text-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center neon-red-glow"
                    >
                        <KeyRound className="mr-2 h-6 w-6" />
                        ENTRAR
                    </Button>
                </div>
            </main>

            <FeatureMarquee />

            <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
        </div>
    );
}
