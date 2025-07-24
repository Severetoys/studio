
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
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';

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
  const db = getFirestore(firebaseApp);

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
            const chatDoc = await getDoc(chatDocRef);
            if (!chatDoc.exists()) {
                const userLanguage = navigator.language.split('-')[0] || 'pt';
                try {
                    await setDoc(chatDocRef, {
                        createdAt: serverTimestamp(),
                        userLanguage: userLanguage,
                        lastSeen: serverTimestamp(),
                    });
                } catch (error) {
                    console.error("Error creating visitor tracking document:", error);
                }
            }
        }
    };

    trackVisitor();

  }, [pathname, db]);

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
