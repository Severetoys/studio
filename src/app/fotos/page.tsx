
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle, Camera } from 'lucide-react';
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, getDocs, Timestamp, orderBy, query } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';


interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Timestamp;
}

export default function FotosPage() {
  const { toast } = useToast();
  const db = getFirestore(firebaseApp);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const photosCollection = collection(db, "photos");
        const q = query(photosCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const photosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Photo));
        setPhotos(photosList);
      } catch (e: any) {
        const errorMessage = e.message || "Ocorreu um erro desconhecido.";
        setError(`Não foi possível carregar as fotos. Motivo: ${errorMessage}`);
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar Galeria',
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhotos();
  }, [toast, db]);

  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light flex items-center justify-center gap-3">
            <Camera /> Galeria de Fotos
          </CardTitle>
          <CardDescription>Conteúdo gratuito gerenciado pelo administrador.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando galeria...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive bg-destructive/10 rounded-lg p-4">
              <AlertCircle className="h-12 w-12" />
              <p className="mt-4 font-semibold">Erro ao carregar a galeria</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
                <Camera className="h-12 w-12" />
                <p className="mt-4 text-lg font-semibold">Nenhuma foto encontrada.</p>
                <p className="text-sm">O administrador ainda não adicionou fotos à galeria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-primary/20 hover:border-primary hover:shadow-neon-red-light transition-all">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.title}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    data-ai-hint="gallery photo"
                  />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-bold line-clamp-2">{photo.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
