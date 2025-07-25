
"use client";

import { useState, useEffect } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import FetishModal from '@/components/fetish-modal';
import type { Fetish } from '@/lib/fetish-data';
import AdultWarningDialog from '@/components/adult-warning-dialog';
import MainHeader from './main-header';
import MainFooter from './main-footer';
import SiteFooter from './site-footer';
import { usePathname } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const getOrCreateChatId = (): string => {
    if (typeof window === 'undefined') {
        return '';
    }
    let chatId = localStorage.getItem('secretChatId');
    if (!chatId) {
        const randomId = Math.random().toString(36).substring(2, 8);
        chatId = `secret-chat-${randomId}`;
        localStorage.setItem('secretChatId', chatId);
    }
    return chatId;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFetish, setSelectedFetish] = useState<Fetish | null>(null);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const hasConfirmedAge = localStorage.getItem('ageConfirmed');
    if (!hasConfirmedAge) {
      setIsWarningOpen(true);
    }

    const trackVisitor = async () => {
        if (pathname.startsWith('/admin')) return;

        const chatId = getOrCreateChatId();
        if (chatId) {
            const chatDocRef = doc(db, 'chats', chatId);
            const userLanguage = navigator.language.split('-')[0] || 'pt';
            try {
                // Use setDoc com merge: true para criar o documento se não existir,
                // ou atualizar o lastSeen se ele existir. Isso evita a leitura prévia (getDoc)
                // que estava causando problemas de permissão.
                await setDoc(chatDocRef, {
                    createdAt: serverTimestamp(),
                    userLanguage: userLanguage,
                    lastSeen: serverTimestamp(),
                }, { merge: true });
            } catch (error) {
                console.error("Error creating/updating visitor tracking document:", error);
            }
        }
    };

    trackVisitor();

  }, [pathname]);

  const handleConfirmAge = () => {
    localStorage.setItem('ageConfirmed', 'true');
    setIsWarningOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleFetishSelect = (fetish: Fetish) => {
    setSelectedFetish(fetish);
    setSidebarOpen(false); // Fecha a sidebar ao selecionar um item
  };

  const handleCloseModal = () => {
    setSelectedFetish(null);
  };

  if (!isClient) {
    return null;
  }

  // Se estiver em uma rota do admin, renderiza apenas o children
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Define as rotas que NÃO devem exibir o cabeçalho e rodapé principais.
  const noMainLayoutRoutes = ['/auth', '/old-auth-page', '/dashboard', '/dashboard/videos', '/chat-secreto'];
  const showMainHeader = !noMainLayoutRoutes.some(route => pathname.startsWith(route));
  const showMainFooter = pathname === '/';
  const showSiteFooter = !noMainLayoutRoutes.some(route => pathname.startsWith(route)) && pathname !== '/';

  return (
    <>
      <AdultWarningDialog isOpen={isWarningOpen} onConfirm={handleConfirmAge} />
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        { !pathname.startsWith('/chat-secreto') && <Header onMenuClick={toggleSidebar} /> }
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={toggleSidebar} 
            onFetishSelect={handleFetishSelect} 
        />
        {showMainHeader && <MainHeader />}
        <main className="flex-grow">{children}</main>
        {showMainFooter && <MainFooter />}
        {showSiteFooter && <SiteFooter />}
      </div>
      {selectedFetish && (
        <FetishModal
          fetish={selectedFetish}
          isOpen={!!selectedFetish}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Layout;
