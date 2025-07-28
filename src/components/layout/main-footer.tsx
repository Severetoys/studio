
"use client";

import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { CornerDownRight, CheckCircle, MapPin, Twitter, Instagram, Youtube, Facebook, Loader2, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    FB: any;
  }
}

interface Review {
  id: string;
  author: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // Firestore Timestamp
  reply?: {
      author: string;
      text: string;
      isVerified: boolean;
      createdAt: any;
  };
}

const MainFooter = () => {
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newReviewAuthor, setNewReviewAuthor] = useState('');
    const [newReviewText, setNewReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const fetchApprovedReviews = async () => {
      setIsLoading(true);
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const approvedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(approvedReviews);
      } catch (e: any) {
        console.error("Error fetching approved reviews:", e);
        setError("Não foi possível carregar os comentários.");
      } finally {
        setIsLoading(false);
      }
    };


    useEffect(() => {
        if (window.FB) {
            window.FB.XFBML.parse();
        }
        fetchApprovedReviews();
    }, []);
    
    const handleAddReview = async () => {
        if (!newReviewAuthor || !newReviewText) {
            toast({ variant: 'destructive', title: 'Por favor, preencha nome e comentário.' });
            return;
        }
        setIsSubmittingReview(true);
        try {
            await addDoc(collection(db, "reviews"), {
                author: newReviewAuthor,
                text: newReviewText,
                status: 'pending',
                createdAt: new Date(),
            });
            toast({ title: 'Comentário enviado para moderação!' });
            setNewReviewAuthor('');
            setNewReviewText('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao enviar comentário.' });
        } finally {
            setIsSubmittingReview(false);
        }
    }

    const galleryWords = ["ACOMPANHANTE MASCULINO", "SENSUALIDADE", "PRAZER", "BDSM", "FETISH", "FANTASIA", "IS"];
      
    const galleries = galleryWords.map((word, i) => ({
        id: i,
        word: word,
        photos: Array.from({ length: 5 }, (_, p) => ({
          src: `https://placehold.co/400x800.png`,
          hint: p % 2 === 0 ? "fashion editorial" : "urban model",
          id: p
        }))
    }));
      
    const ReviewCard = ({ review }: { review: Review }) => {
        const fallback = review.author.substring(0, 2).toUpperCase();
        const avatarSrc = `https://placehold.co/100x100.png?text=${fallback}`;
        const reviewDate = review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('pt-BR') : 'Data indisponível';


        return (
            <Card className="flex flex-col w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
              <CardContent className="flex flex-col items-start text-left p-0 flex-grow gap-4">
                <div className="flex items-center gap-4 w-full">
                  <Avatar className="w-12 h-12 border-2 border-primary">
                    <AvatarImage src={avatarSrc} data-ai-hint="user profile" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{review.author}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{reviewDate}</p>
                  </div>
                </div>
                <p className="text-foreground text-sm flex-grow">{review.text}</p>
                {review.reply && (
                  <div className="w-full pl-6 mt-4 border-l-2 border-primary/30">
                     <div className="flex items-start gap-3">
                        <CornerDownRight className="h-4 w-4 mt-1 text-primary/80 flex-shrink-0" />
                        <div className="flex-1">
                           <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{review.reply.author}</h4>
                                {review.reply.isVerified && <CheckCircle className="h-5 w-5 text-blue-400" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{review.reply.createdAt?.toDate ? review.reply.createdAt.toDate().toLocaleDateString('pt-BR') : ''}</p>
                           <p className="text-foreground text-sm mt-2">{review.reply.text}</p>
                        </div>
                    </div>
                  </div>
                )}
                 <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary">Responder</Button>
              </CardContent>
            </Card>
        );
    }

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
                                  </div>
                                </CarouselItem>
                              ))}
                          </CarouselContent>
                          <CarouselPrevious className="ml-14 bg-background/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                          <CarouselNext className="mr-14 bg-background/50 border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
                      </Carousel>
                      <p className="text-center text-primary text-shadow-neon-red-light text-4xl tracking-widest uppercase mt-2">
                        {gallery.word}
                      </p>
                    </div>
                    <Separator className="max-w-xl mx-auto my-8 bg-border/30" />
                  </div>
                ))}
            </div>
            
            <div className="px-4 md:px-8 py-12 bg-background flex flex-col items-center">
                 <div className="max-w-4xl w-full mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-shadow-neon-red flex items-center justify-center gap-2">
                        <MapPin className="h-8 w-8 text-primary"/>
                        Localização
                    </h2>
                    <Card className="overflow-hidden bg-card/50 border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all duration-300">
                        <CardContent className="p-2">
                             <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.145944983025!2d-46.656539084476!3d-23.56306366754635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0x2665c5b4e7b6a4b!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%20Brasil!5e0!3m2!1spt-BR!2sus!4v1625845012345!5m2!1spt-BR!2sus"
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="px-4 md:px-8 py-12 bg-background flex flex-col items-center">
                <div className="max-w-4xl w-full mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-8 text-shadow-neon-red">O que dizem sobre mim</h2>
                    
                    <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Deixe sua avaliação</h3>
                        <div className="space-y-4">
                            <Input 
                                placeholder="Seu nome"
                                value={newReviewAuthor}
                                onChange={(e) => setNewReviewAuthor(e.target.value)}
                            />
                            <Textarea 
                                placeholder="Escreva seu comentário aqui..."
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                            />
                            <Button onClick={handleAddReview} disabled={isSubmittingReview}>
                                {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Enviar Comentário
                            </Button>
                        </div>
                    </Card>
                    
                    <div className="flex flex-col items-center gap-6">
                      {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin"/>
                          Carregando avaliações...
                        </div>
                      )}
                      {error && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-6 w-6"/>
                          {error}
                        </div>
                      )}
                      {!isLoading && !error && reviews.length === 0 && (
                        <p className="text-muted-foreground">Nenhuma avaliação aprovada ainda.</p>
                      )}
                      {!isLoading && !error && reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                </div>
            </div>
            
            <footer className="w-full p-4 text-center text-sm text-muted-foreground">
              <Separator className="mb-4 bg-primary/50" />
               <div className="my-4 flex justify-center">
                <div
                    className="fb-like"
                    data-share="true"
                    data-width="450"
                    data-show-faces="true"
                >
                </div>
              </div>
              <p>Copyrights © Italo Santos 2019 - Todos os direitos reservados</p>
               <div className="flex justify-center gap-4 my-4">
                  <a href="#" aria-label="Twitter">
                      <Twitter className="h-5 w-5 text-primary hover:text-primary/80" />
                  </a>
                  <a href="#" aria-label="Instagram">
                      <Instagram className="h-5 w-5 text-primary hover:text-primary/80" />
                  </a>
                  <a href="#" aria-label="YouTube">
                      <Youtube className="h-5 w-5 text-primary hover:text-primary/80" />
                  </a>
                  <a href="#" aria-label="Facebook">
                    <Facebook className="h-5 w-5 text-primary hover:text-primary/80" />
                </a>
              </div>
              <p>
                  <a href="/termos-condicoes" className="underline hover:text-primary">Termos & Condições</a> | <a href="/politica-de-privacidade" className="underline hover:text-primary">Política de Privacidade</a>
              </p>
              <p className="mt-2">Este site inclui conteúdo protegido por direitos autorais, é proibida reprodução total ou parcial deste conteúdo sem autorização prévia do proprietário do site.</p>
            </footer>
        </>
    );
};

export default MainFooter;
