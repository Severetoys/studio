
"use client";

import Layout from '@/components/layout/layout';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <Layout>
      <div className="flex-grow">
        <div className="relative w-full h-[60vh] text-center flex items-center justify-center bg-black">
          <Image
            src="https://placehold.co/1080x1920.png"
            alt="Hero background"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
            data-ai-hint="model photo"
          />
          <div className="relative border-4 border-white p-4">
            <h1 className="text-6xl font-serif text-white">Italo Santos</h1>
          </div>
        </div>
        <div className="p-4 md:p-8 bg-background">
           <Button 
            className="w-full h-24 bg-zinc-900 hover:bg-zinc-800 text-white text-2xl"
            onClick={() => router.push('/auth')}>
            <Fingerprint className="h-10 w-10 mr-4" />
            Face ID
          </Button>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="h-40 bg-zinc-200 dark:bg-zinc-900"></Card>
            <Card className="h-40 bg-zinc-200 dark:bg-zinc-900"></Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
