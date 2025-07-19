
"use client";

import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetishCategories, Fetish } from '@/lib/fetish-data';
import AboutSection from '@/components/about-section';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFetishSelect: (fetish: Fetish) => void;
}

const Sidebar = ({ isOpen, onClose, onFetishSelect }: SidebarProps) => {
  const router = useRouter();
  
  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleFetishClick = (item: Fetish) => {
    onFetishSelect(item);
    onClose();
  };
  
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <aside className={`fixed top-0 left-0 h-full w-64 bg-card text-card-foreground shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-primary/30`}>
        <div className="p-4 flex justify-between items-center border-b border-border">
          <h2 className="text-xl font-bold text-shadow-neon-red-light">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-primary hover:bg-primary/10">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="p-4 overflow-y-auto h-[calc(100%-65px)]">
          <ul className="space-y-2">
            <li>
              <Button variant="destructive" className="w-full justify-start text-base py-6 bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong transition-all duration-300" onClick={() => handleNavigate('/auth')}>
                +18 ADULT WORK
              </Button>
            </li>
            <li><Link href="/" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>INÍCIO</Link></li>
            <li><Link href="/canais" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>CANAIS</Link></li>
            <li><Link href="/loja" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>LOJA ON-LINE</Link></li>
            <li><Link href="/aluga-se" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>ALUGA-SE</Link></li>
            <li><Link href="/fotos" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>FOTOS</Link></li>
            <li><Button variant="ghost" className="w-full justify-start p-3 text-base hover:bg-muted hover:text-primary" onClick={() => handleNavigate('/auth')}>ASSINATURA</Button></li>
            <li><Link href="/dashboard/videos" className="block p-3 rounded-md hover:bg-muted" onClick={onClose}>VIDEOS</Link></li>
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="about" className="border-none">
                  <AccordionTrigger className="p-3 hover:no-underline hover:bg-muted rounded-md text-base">SOBRE</AccordionTrigger>
                  <AccordionContent className="pl-4 pt-2 text-muted-foreground text-sm space-y-4">
                      <div className="text-sm text-muted-foreground space-y-4">
                        <h3 className="font-semibold text-primary/90">Características Físicas</h3>
                        <p>1,69m de altura e 70kg com cabelo castanho claro corpo atlético magro definido um dote de 20cm.</p>
                        <p>Fetichista elite. Costumo dizer isso pois para meus servos o cachê que pagam indiferente em suas vidas.</p>
                        <p>Independentemente do status social trato todos igualmente mesmo aqueles que só possam ter o prazer de desfrutar da minha companhia uma vez ao mês.</p>
                        <p>Sou cordial e autoritário, o acompanhante ideal para te iniciar em suas maiores fantasias sexuais.</p>
                        
                        <h3 className="font-semibold text-primary/90 mt-4">Durante as sessões</h3>
                        <p>Gosto de proporcionar experiências únicas libertando os desejos mais obscuros e reprimidos. Realizo vários fetichessendo minhas práticas com mais experiência: D/s, fisting, pet-play, pissing, spit, leather, anal play, nipple play, ass play, spanking, humilhação, CBT, wax, sissificação, e-stim, bondage, asfixia. Disponho de acessórios e brinquedos para aquecer a relação.</p>
                        <p>Para aqueles que não têm fantasias e fetiches, podemos ter uma relação sexual normal sem práticas.</p>
                        <p>Tudo à disposição em um ambiente climatizado, seguro e confortável, com chuveiro quente, toalha limpa, sabonete, álcool gel, camisinha e lubrificante. Contrate-me no WhatsApp e me encontre aqui no meu local.</p>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              <AccordionItem value="fetish-bdsm" className="border-none">
                <AccordionTrigger className="p-3 hover:no-underline hover:bg-muted rounded-md text-base">FETISH &amp; BDSM</AccordionTrigger>
                <AccordionContent className="pl-4">
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(fetishCategories).map(([category, items]) => (
                      <AccordionItem key={category} value={category} className="border-none">
                        <AccordionTrigger className="py-2 px-2 text-sm hover:no-underline hover:bg-muted/50 rounded-md">{category}</AccordionTrigger>
                        <AccordionContent className="pl-4">
                          <ul className="space-y-1 pt-1">
                            {items.map((item) => (
                               <li key={item.id}>
                                <button onClick={() => handleFetishClick(item)} className="block w-full text-left p-2 text-xs rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50">
                                  {item.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
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
