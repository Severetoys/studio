
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Upload, Link as LinkIcon } from "lucide-react";
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
import { collection, addDoc, getDocs, Timestamp, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app as firebaseApp, db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const storage = getStorage(firebaseApp);

  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

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
    setVideoUrl('');
    setThumbnailUrl('');
    setActiveTab("upload");
  };

  const handleAddVideo = async () => {
    if (!title || !price) {
        toast({ variant: "destructive", title: "Título e preço são obrigatórios." });
        return;
    }
    if (activeTab === 'upload' && !videoFile) {
        toast({ variant: "destructive", title: "Arquivo de vídeo é obrigatório." });
        return;
    }
    if (activeTab === 'link' && !videoUrl) {
        toast({ variant: "destructive", title: "URL do vídeo é obrigatória." });
        return;
    }

    setIsSubmitting(true);
    let finalVideoUrl = videoUrl;
    let videoStoragePath = `italosantos.com/videos-by-url/${Date.now()}_${title.replace(/\s/g, '_')}`;

    try {
      if (activeTab === 'upload' && videoFile) {
        videoStoragePath = `italosantos.com/videos/${Date.now()}_${videoFile.name}`;
        const videoStorageRef = ref(storage, videoStoragePath);
        await uploadBytes(videoStorageRef, videoFile);
        finalVideoUrl = await getDownloadURL(videoStorageRef);
      }

      await addDoc(collection(db, "videos"), {
        title,
        description,
        price: parseFloat(price),
        videoUrl: finalVideoUrl,
        thumbnailUrl: thumbnailUrl || 'https://placehold.co/600x400.png',
        videoStoragePath: activeTab === 'upload' ? videoStoragePath : 'external',
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
      
      if (video.videoStoragePath && video.videoStoragePath !== 'external') {
        const videoRef = ref(storage, video.videoStoragePath);
        await deleteObject(videoRef);
      }

      if (video.thumbnailStoragePath && !video.thumbnailUrl.startsWith('https://placehold.co')) {
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
                        Faça o upload de um novo vídeo para venda a partir de um arquivo ou um link externo.
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
                        <Label htmlFor="thumbnailUrl" className="text-right">URL da Thumbnail</Label>
                        <Input id="thumbnailUrl" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="Opcional: https://.../thumb.jpg" className="col-span-3" />
                    </div>
                </div>
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2"/>Upload de Vídeo</TabsTrigger>
                        <TabsTrigger value="link"><LinkIcon className="h-4 w-4 mr-2"/>Link do Vídeo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                         <div className="grid grid-cols-4 items-center gap-4 pt-4">
                            <Label htmlFor="file" className="text-right">Arquivo</Label>
                            <Input id="file" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" />
                        </div>
                    </TabsContent>
                    <TabsContent value="link">
                         <div className="grid grid-cols-4 items-center gap-4 pt-4">
                            <Label htmlFor="videoUrl" className="text-right">URL</Label>
                            <Input id="videoUrl" placeholder="https://exemplo.com/video.mp4" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="col-span-3" />
                        </div>
                    </TabsContent>
                </Tabs>
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
