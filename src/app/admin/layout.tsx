
"use client";

import { useState } from 'react';
import AdminHeader from '@/components/admin/header';
import AdminSidebar from '@/components/admin/sidebar';
import AdminLoginPage from './login/page';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    router.replace("/admin/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  if (!isClient) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <AdminLoginPage onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  if (!isAuthenticated) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground">Verificando autorização...</p>
      </div>
    );
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar para Desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <AdminSidebar onLogout={handleLogout} />
      </div>

      {/* Layout Principal */}
      <div className="flex flex-col">
        {/* Cabeçalho para Mobile */}
        <AdminHeader onMenuClick={toggleSidebar} />
        
        {/* Conteúdo da Página */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar para Mobile (Sheet) */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden" 
            onClick={toggleSidebar}
        >
            <div 
                className="fixed top-0 left-0 h-full w-[280px] bg-muted/40 z-40 border-r"
                onClick={(e) => e.stopPropagation()}
            >
                <AdminSidebar onLogout={() => {
                    handleLogout();
                    toggleSidebar();
                }} />
            </div>
        </div>
      )}
    </div>
  );
}
