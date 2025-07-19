
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
  
  const fetishCategories = {
    "Dirty": ["urinolagnia", "scat", "olfactofilia", "omorash", "pissing", "podolatria", "salirophilia", "ass-to-mouth"],
    "Leather/Latex": ["leather/latex", "leather", "leather/clothed-sex"],
    "Fantasy": ["cenoura-play", "daddyboy", "adult-nursing", "hirsutofilia", "clamping", "feederism", "tickling"],
    "Knife-Play/E-Stim": ["knife-play/e-stim-play", "knife-play/axe-play", "knife-play/wax-play", "knife-play"],
    "Muscle Worship": ["muscle-worship", "muscle-worship/thigh-worship"],
    "Dominação e Submissão": [
      "candle-wax-play", "military-play", "pet-play/pony-play", "pet-play",
      "butt-plug-play", "medical-play", "ass-play", "food-play", "gender-play",
      "temperature-play", "necro-play", "role-play", "diaper-play", "furry-play",
      "blood-play", "public-play", "pet-play/puppy-play", "pet-play",
      "diaper-play", "furry-play", "blood-play", "public-play"
    ],
    "Sadomasoquismo": [
      "masterslave", "anal-hook", "spanking", "nipple-torture", "tease-and-denial",
      "candle-wax", "inflamation", "tickle-torture", "sounding", "asfixiofilia",
      "castration-fantasy", "cbt", "choking", "breath-control"
    ],
    "Mumification": ["mumification", "breast-bondage", "shibari/cock-ring", "bondage", "shibari/chastity", "shibari/hogtie", "shibari"],
    "Sex": [
      "cuckolding", "oral-worship", "rimming", "voyeurismo", "gang-bang",
      "voyeurismo-social", "voyeurismo-exibicionista", "cuckolding", "garganta-profunda",
      "dp", "glory-hole", "ball-gag"
    ],
    "Interracial Fetish": [
      "super-hero-fetish", "inch-high-fetish", "barber-fetish", "armpit-fetish",
      "inflatulabe-suit-fetish", "body-hair-fetish"
    ],
    "Sissy/Crossdresser": ["sissy/crossdresser-cd", "sissy", "sissy/drag"],
    "Outros": ["cum-play", "humiliation-play", "uniform-play", "findom", "enema-play", "nipple-play"]
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
        <nav className="p-4 overflow-y-auto h-[calc(100%-65px)]">
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
              <AccordionItem value="fetish-bdsm" className="border-none">
                <AccordionTrigger className="p-3 hover:no-underline hover:bg-muted rounded-md">FETISH & BDSM</AccordionTrigger>
                <AccordionContent className="pl-4">
                  <Accordion type="multiple" className="w-full">
                    {Object.entries(fetishCategories).map(([category, items]) => (
                      <AccordionItem key={category} value={category} className="border-none">
                        <AccordionTrigger className="py-2 px-2 text-sm hover:no-underline hover:bg-muted/50 rounded-md">{category}</AccordionTrigger>
                        <AccordionContent className="pl-4">
                          <ul className="space-y-1 pt-1">
                            {items.map((item) => (
                              <li key={item}>
                                <Link href="#" className="block p-2 text-xs rounded-md hover:bg-muted/50" onClick={onClose}>
                                  {item.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Link>
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

    