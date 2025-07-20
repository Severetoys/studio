
"use client";

import Link from 'next/link';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SiteFooter = () => {
    return (
        <>
            <Separator className="my-4 bg-primary/50" />
            <footer className="w-full p-4 text-center text-sm text-muted-foreground">
              <p>Copyrights © Italo Santos 2019 - Todos os direitos reservados</p>
               <div className="flex justify-center gap-4 my-4">
                  <Link href="#" aria-label="Twitter">
                      <Twitter className="h-5 w-5 text-primary hover:text-primary/80" />
                  </Link>
                  <Link href="#" aria-label="Instagram">
                      <Instagram className="h-5 w-5 text-primary hover:text-primary/80" />
                  </Link>
                  <Link href="#" aria-label="YouTube">
                      <Youtube className="h-5 w-5 text-primary hover:text-primary/80" />
                  </Link>
                  <Link href="#" aria-label="Facebook">
                    <Facebook className="h-5 w-5 text-primary hover:text-primary/80" />
                </Link>
              </div>
              <p>
                  <a href="/termos-condicoes" className="underline hover:text-primary">Termos & Condições</a> | <a href="/politica-de-privacidade" className="underline hover:text-primary">Política de Privacidade</a>
              </p>
              <p className="mt-2">Este site inclui conteúdo protegido por direitos autorais, é proibida reprodução total ou parcial deste conteúdo sem autorização prévia do proprietário do site.</p>
            </footer>
        </>
    );
};

export default SiteFooter;
