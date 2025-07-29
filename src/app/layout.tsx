
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
      <head>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXXX');
            `}
          </Script>
      </head>
      <body className={`font-sans ${inter.variable} antialiased bg-background`}>
        <noscript>
            <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
            ></iframe>
        </noscript>
        
        <div id="fb-root"></div>
        <Script id="facebook-jssdk" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId      : '3924094051199143',
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
