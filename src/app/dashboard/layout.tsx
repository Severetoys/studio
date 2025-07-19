
"use client";

import { useState } from 'react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import MainHeader from '@/components/layout/main-header';
import MainFooter from '@/components/layout/main-footer';


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
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onFetishSelect={() => {}} />
      <MainHeader />
      <main className="flex-grow">{children}</main>
      <MainFooter />
    </div>
  );
}

    