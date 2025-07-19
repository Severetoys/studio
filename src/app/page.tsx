
"use client";

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/layout';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fingerprint } from 'lucide-react';
import AdultWarningDialog from '@/components/adult-warning-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function HomePage() {
  const router = useRouter();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasConfirmedAge = localStorage.getItem('ageConfirmed');
    if (!hasConfirmedAge) {
      setIsWarningOpen(true);
    }
  }, []);

  const handleConfirmAge = () => {
    localStorage.setItem('ageConfirmed', 'true');
    setIsWarningOpen(false);
  };

  if (!isClient) {
    return null; // Don't render anything on the server to avoid hydration mismatch
  }
  
  const PhotoCarousel = ({ title, photos }: { title: string, photos: { src: string, hint: string }[] }) => (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4 px-4 md:px-8">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden">
                  <CardContent className="flex aspect-[3/4] items-center justify-center p-0">
                    <Image
                      src={photo.src}
                      alt={`${title} - Foto ${index + 1}`}
                      width={400}
                      height={600}
                      className="w-full h-full object-cover"
                      data-ai-hint={photo.hint}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-12" />
        <CarouselNext className="mr-12" />
      </Carousel>
    </div>
  );

  const galleries = Array.from({ length: 8 }, (_, i) => ({
    title: `Galeria ${i + 1}`,
    photos: Array.from({ length: 9 }, (_, pIndex) => ({
        src: `https://placehold.co/400x600.png`,
        hint: i % 2 === 0 ? "fashion editorial" : "urban model"
    }))
  }));

  return (
    <Layout>
      <AdultWarningDialog isOpen={isWarningOpen} onConfirm={handleConfirmAge} />
      <div className="flex-grow">
        <div className="relative w-full h-[60vh] text-center flex items-center justify-center bg-black">
          <Image
            src="https://placehold.co/1920x1080.png"
            alt="Hero background"
            layout="fill"
            objectFit="cover"
            className="opacity-50"
            data-ai-hint="male model"
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
        </div>
        <div className="bg-background">
            {galleries.map(gallery => (
                <PhotoCarousel key={gallery.title} title={gallery.title} photos={gallery.photos} />
            ))}
        </div>
      </div>
    </Layout>
  );
}
