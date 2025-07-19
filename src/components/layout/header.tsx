
"use client";

import { Button } from '@/components/ui/button';
import { Menu, Search, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <Link href="/" className="text-2xl font-bold text-primary">
            Italo Santos
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('/auth')}>
            <User className="h-6 w-6" />
            <span className="sr-only">Login</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
