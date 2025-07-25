
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from 'next/font/google';
import Layout from '@/components/layout/layout';
import WhatsAppButton from '@/components/whatsapp-button';
import Script from 'next/script';
import ScreenProtector from '@/components/screen-protector';

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
        <div id="fb-root"></div>
        <Script id="facebook-jssdk" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId      : '1029313609296207',
                cookie     : true,
                xfbml      : true,
                version    : 'v23.0'
              });
              
              FB.AppEvents.logPageView();

              // Dispara um evento personalizado quando o SDK estiver pronto
              window.dispatchEvent(new Event('fb-sdk-ready'));
            };

            (function(d, s, id){
               var js, fjs = d.getElementsByTagName(s)[0];
               if (d.getElementById(id)) {return;}
               js = d.createElement(s); js.id = id;
               js.src = "https://connect.facebook.net/en_US/sdk.js";
               fjs.parentNode.insertBefore(js, fjs);
             }(document, 'script', 'facebook-jssdk'));
          `}
        </Script>
        
        <Layout>
          {children}
        </Layout>
        <Toaster />
        <WhatsAppButton />
        <ScreenProtector />
      </body>
    </html>
  );
}
