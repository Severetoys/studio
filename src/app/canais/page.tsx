
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

const channels = [
  { name: 'Airbnb', href: '#' },
  { name: 'GarotoComLocal', href: '#' },
  { name: 'BoyToy', href: '#' },
  { name: 'OnNowPlay', href: '#' },
  { name: 'FatalModel', href: '#' },
  { name: 'Skokka', href: '#' },
  { name: 'Rentman', href: '#' },
  { name: 'Hunqz', href: '#' },
  { name: 'Grindr', href: '#' },
  { name: 'OnlyFans', href: '#' },
  { name: 'XVideos', href: '#' },
  { name: 'VivaLocal', href: '#' },
];

export default function CanaisPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center">
            Canais de Divulgação
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6">
          {channels.map((channel) => (
            <Link href={channel.href} key={channel.name} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="w-full bg-card/50 border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300 flex items-center justify-center p-6 min-h-[100px]">
                <h3 className="text-2xl font-bold text-center text-muted-foreground group-hover:text-primary transition-colors">
                  {channel.name}
                </h3>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
