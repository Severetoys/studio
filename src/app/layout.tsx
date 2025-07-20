
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import Layout from '@/components/layout/layout';
import WhatsAppButton from '@/components/whatsapp-button';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AuthKit',
  description: 'Autenticação segura e simples para aplicações modernas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} antialiased bg-background`}>
        <Script 
          src={`https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID}&currency=BRL&enable-funding=paylater,card,googlepay,applepay`}
          strategy="beforeInteractive"
        />
        <Layout>
          {children}
        </Layout>
        <Toaster />
        <WhatsAppButton />
      </body>
    </html>
  );
}
