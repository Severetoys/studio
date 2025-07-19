
"use client";

import { useState } from 'react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Twitter, Instagram, Youtube } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <main className="flex-grow">{children}</main>
      <Separator className="my-4 bg-border/20" />
      <footer className="w-full p-4 text-center text-sm text-muted-foreground">
        <p>Copyrights © Italo Santos 2019 - Todos os direitos reservados</p>
        <p>
            <a href="#" className="underline hover:text-primary">Termos & Condições</a> | <a href="#" className="underline hover:text-primary">Política de Privacidade</a>
        </p>
        <p className="mt-2">Este site inclui conteúdo protegido por direitos autorais, é proibida reprodução total ou parcial deste conteúdo sem autorização prévia do proprietário do site.</p>
        <div className="flex justify-center gap-4 mt-4">
            <Link href="#" aria-label="Twitter">
                <Twitter className="h-5 w-5 hover:text-primary" />
            </Link>
            <Link href="#" aria-label="Instagram">
                <Instagram className="h-5 w-5 hover:text-primary" />
            </Link>
            <Link href="#" aria-label="YouTube">
                <Youtube className="h-5 w-5 hover:text-primary" />
            </Link>
        </div>
      </footer>
    </div>
  );
}
