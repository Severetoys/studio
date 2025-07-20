
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, addDoc, getDocs, Timestamp, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app as firebaseApp } from '@/lib/firebase';

interface Video {
  id: string;
  title: string;
  description: string;
  price: number;
  videoUrl: string;
  thumbnailUrl: string;
  videoStoragePath: string;
  thumbnailStoragePath?: string;
  createdAt: Timestamp;
}

export default function AdminVideosPage() {
  const { toast } = useToast();
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const videosCollection = collection(db, "videos");
      const q = query(videosCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const videosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Video));
      setVideos(videosList);
    } catch (error) {
      console.error("Error fetching videos: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar vídeos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setVideoFile(null);
  };

  const handleAddVideo = async () => {
    if (!title || !price || !videoFile) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Título, preço e arquivo de vídeo são obrigatórios.",
      });
      return;
    }

    setIsSubmitting(true);
    const videoStoragePath = `videos/${Date.now()}_${videoFile.name}`;
    try {
      // 1. Upload video file to Firebase Storage
      const videoStorageRef = ref(storage, videoStoragePath);
      const videoSnapshot = await uploadBytes(videoStorageRef, videoFile);
      const videoDownloadURL = await getDownloadURL(videoSnapshot.ref);

      // 2. Add video metadata to Firestore
      await addDoc(collection(db, "videos"), {
        title,
        description,
        price: parseFloat(price),
        videoUrl: videoDownloadURL,
        thumbnailUrl: 'https://placehold.co/600x400.png', // Placeholder thumbnail
        videoStoragePath,
        createdAt: Timestamp.now(),
      });
      
      toast({
        title: "Vídeo Adicionado!",
        description: "Seu novo vídeo foi salvo com sucesso.",
      });
      
      resetForm();
      setIsDialogOpen(false);
      await fetchVideos(); // Refresh the list
    } catch (error) {
      console.error("Error adding video: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar vídeo",
        description: "Ocorreu um erro ao salvar o vídeo. Verifique as regras do Firebase Storage."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo? Esta ação é irreversível.")) return;
    try {
      await deleteDoc(doc(db, "videos", video.id));
      
      const videoRef = ref(storage, video.videoStoragePath);
      await deleteObject(videoRef);

      if (video.thumbnailStoragePath) {
        const thumbRef = ref(storage, video.thumbnailStoragePath);
        await deleteObject(thumbRef);
      }

      toast({
        title: "Vídeo Excluído",
      });
      await fetchVideos(); // Refresh
    } catch (error) {
      console.error("Error deleting video: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir vídeo",
      });
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Vídeos</h1>
        <div className="ml-auto flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Vídeo
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Vídeo</DialogTitle>
                    <DialogDescription>
                        Faça o upload de um novo vídeo para venda.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Bastidores Exclusivos" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Descrição</Label>
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o conteúdo do vídeo..." className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Preço (Avulso)</Label>
                        <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="49.90" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">Arquivo</Label>
                        <Input id="file" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={handleAddVideo} disabled={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar Vídeo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Videoteca</CardTitle>
          <CardDescription>
            Gerencie os vídeos exibidos no seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <p>Carregando vídeos...</p>
            ) : videos.length === 0 ? (
                <p className="text-muted-foreground text-center">Nenhum vídeo adicionado ainda.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                        <Card key={video.id}>
                            <CardHeader className="p-0">
                                <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                                    <Image src={video.thumbnailUrl} alt="Thumbnail" width={600} height={400} className="w-full h-full object-cover" data-ai-hint="video thumbnail"/>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <h3 className="font-semibold truncate">{video.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{video.description}</p>
                                <p className="text-sm font-bold text-primary mt-2">R$ {video.price.toFixed(2)}</p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" size="sm"><Edit className="h-3 w-3 mr-1"/> Editar</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video)}>
                                    <Trash2 className="h-3 w-3 mr-1"/>Excluir
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}
