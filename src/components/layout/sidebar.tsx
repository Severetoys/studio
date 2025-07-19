
"use client";

import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();
  
  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };
  
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <aside className={`fixed top-0 left-0 h-full w-64 bg-card text-card-foreground shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b border-border">
          <h2 className="text-xl font-bold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Button variant="secondary" className="w-full justify-start text-base py-6">
                +18 ADULT WORK
              </Button>
            </li>
            <li><Link href="/" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>Início</Link></li>
            <li><Link href="#" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>CANAIS</Link></li>
            <li><Link href="#" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>LOJA ON-LINE</Link></li>
            <li><Link href="#" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>ALUGA-SE</Link></li>
            <li><Link href="#" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>Untitled page</Link></li>
            <li><Link href="#" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>FOTOS</Link></li>
            <li><Button variant="ghost" className="w-full justify-start p-3 text-base" onClick={() => handleNavigate('/auth')}>ASSINATURA</Button></li>
            <li><Link href="/dashboard/videos" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>VIDEOS</Link></li>
             <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="p-3 hover:no-underline hover:bg-muted rounded-md">FETISH & BDSM</AccordionTrigger>
                <AccordionContent className="pl-6">
                  <ul className="space-y-2 pt-2">
                    <li><Link href="#" className="block p-2 rounded-md hover:bg-muted/50" onClick={onClose}>Sub-item 1</Link></li>
                    <li><Link href="#" className="block p-2 rounded-md hover:bg-muted/50" onClick={onClose}>Sub-item 2</Link></li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
