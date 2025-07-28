
"use client";

import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between border-b border-primary/50">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link href="/" className="text-2xl font-bold text-shadow-neon-red-light">
            IS
          </Link>
        </div>
        <div className="flex-1 flex justify-center px-4">
          {/* O botão foi movido para o layout principal para ficar fixo no topo */}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
