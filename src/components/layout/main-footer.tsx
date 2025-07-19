
"use client";

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SiteFooter from './site-footer';


const MainFooter = () => {

    const galleries = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        title: `Galeria ${i + 1}`,
        photos: Array.from({ length: 5 }, (_, p) => ({
          src: `https://placehold.co/400x800.png`,
          hint: p % 2 === 0 ? "fashion editorial" : "urban model",
          id: p,
          word: "Fetiche" // Palavra de exemplo
        }))
      }));
      
      const reviews = [
        {
          name: 'João S.',
          rating: 5,
          text: 'Experiência incrível, conteúdo de alta qualidade! Superou todas as minhas expectativas. Recomendo fortemente.',
          avatarSrc: 'https://placehold.co/100x100.png',
          avatarFallback: 'JS',
          aiHint: "male profile"
        },
        {
          name: 'Marcos P.',
          rating: 5,
          text: 'Qualidade impecável e muito profissionalismo. O melhor que já vi na área, sem dúvidas. Vale cada centavo.',
          avatarSrc: 'https://placehold.co/100x100.png',
          avatarFallback: 'MP',
          aiHint: "man avatar"
        },
        {
          name: 'Lucas R.',
          rating: 5,
          text: 'Conteúdo exclusivo e um atendimento diferenciado. A assinatura abriu portas para um novo universo. Excelente!',
          avatarSrc: 'https://placehold.co/100x100.png',
          avatarFallback: 'LR',
          aiHint: "user portrait"
        },
      ];

    return (
        <>
            <Separator className="my-4 bg-primary/50" />
            <div className="py-8 space-y-8">
                {galleries.map((gallery) => (
                  <div key={gallery.id}>
                    <div className="w-full px-4 md:px-8">
                      <Carousel className="w-full" opts={{ loop: true }}>
                          <CarouselContent>
                              {gallery.photos.map((photo) => (
                                <CarouselItem key={photo.id} className="basis-full">
                                  <div className="p-1 space-y-2">
                                    <Card className="overflow-hidden border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                                      <CardContent className="flex aspect-[9/16] items-center justify-center p-0">
                                        <Image
                                            src={photo.src}
                                            alt={`Foto da galeria ${gallery.id + 1}`}
                                            width={400}
                                            height={800}
                                            className="w-full h-full object-cover"
                                            data-ai-hint={photo.hint}
                                          />
                                      </CardContent>
                                    </Card>
                                    <p className="text-center text-primary text-shadow-neon-red-light text-sm tracking-widest uppercase">
                                        {photo.word}
                                    </p>
                                  </div>
                                </CarouselItem>
                              ))}
                          </CarouselContent>
                          <CarouselPrevious className="ml-14 bg-background/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                          <CarouselNext className="mr-14 bg-background/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                      </Carousel>
                    </div>
                    <Separator className="max-w-xl mx-auto my-8 bg-border/30" />
                  </div>
                ))}
            </div>
            
            <div className="px-4 md:px-8 py-12 bg-background flex flex-col items-center">
                <div className="text-center mb-12">
                    <p className="text-8xl font-bold text-primary text-shadow-neon-red-light">IS</p>
                </div>
            
                <div className="max-w-4xl w-full mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-shadow-neon-red">O que dizem sobre mim</h2>
                    <div className="flex flex-col items-center gap-6">
                      {reviews.map((review, index) => (
                        <Card key={index} className="flex flex-col w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                          <CardContent className="flex flex-col items-center text-center p-0 flex-grow">
                            <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                              <AvatarImage src={review.avatarSrc} data-ai-hint={review.aiHint} />
                              <AvatarFallback>{review.avatarFallback}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-lg">{review.name}</h3>
                            <div className="flex gap-1 my-2 text-primary">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-current" />
                              ))}
                            </div>
                            <p className="text-muted-foreground text-sm flex-grow">{review.text}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                </div>
            </div>
            <SiteFooter />
        </>
    );
};

export default MainFooter;
