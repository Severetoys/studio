
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const photos = [
  { id: 1, src: "https://placehold.co/600x400.png", alt: "Foto 1", aiHint: "male model portrait" },
  { id: 2, src: "https://placehold.co/600x400.png", alt: "Foto 2", aiHint: "artistic photo" },
  { id: 3, src: "https://placehold.co/600x400.png", alt: "Foto 3", aiHint: "fashion editorial" },
  { id: 4, src: "https://placehold.co/600x400.png", alt: "Foto 4", aiHint: "studio lighting" },
  { id: 5, src: "https://placehold.co/600x400.png", alt: "Foto 5", aiHint: "black and white" },
  { id: 6, src: "https://placehold.co/600x400.png", alt: "Foto 6", aiHint: "outdoor photoshoot" },
];

export default function FotosPage() {
  return (
    <main className="flex flex-1 w-full flex-col items-center p-4 bg-background">
      <Card className="w-full max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary text-shadow-neon-red-light text-center">
            Fotos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={600}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                data-ai-hint={photo.aiHint}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
