
"use client";

import { Button } from '@/components/ui/button';
import { Menu, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between border-b border-border/40">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link href="/" className="text-2xl font-bold">
            IS
          </Link>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="secondary" className="hidden sm:flex h-8" onClick={() => router.push('/auth')}>
            +18 ADULT WORK
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

    