
"use client";

import { useState } from 'react';
import Header from './header';
import Sidebar from './sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <main className="flex-grow">{children}</main>
      <footer className="w-full p-4 text-center text-sm text-muted-foreground">
        <p>Copyrights © Italo Santos 2025 - Todos os direitos reservados</p>
        <p>
            <a href="#" className="underline hover:text-primary">Termos & Condições</a> | <a href="#" className="underline hover:text-primary">Política de Privacidade</a>
        </p>
        <p className="mt-2">Este site inclui conteúdo protegido por direitos autorais, é proibida reprodução total ou parcial deste conteúdo sem autorização prévia do proprietário do site.</p>
      </footer>
    </div>
  );
};

export default Layout;
