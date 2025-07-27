
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, getDocs, Timestamp, doc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app, db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';

interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  storagePath: string;
  createdAt: Timestamp;
}

export default function AdminPhotosPage() {
  const { toast } = useToast();
  const storage = getStorage(app);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const photosCollection = collection(db, "photos");
      const q = query(photosCollection, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const photosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Photo));
      setPhotos(photosList);
    } catch (error) {
      console.error("Error fetching photos: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar fotos",
        description: "Não foi possível buscar as fotos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const resetForm = () => {
    setTitle('');
    setFile(null);
    setImageUrl('');
    setActiveTab("upload");
  };

  const handleAddPhoto = async () => {
    if (!title) {
        toast({ variant: "destructive", title: "Título é obrigatório" });
        return;
    }
    if (activeTab === 'upload' && !file) {
        toast({ variant: "destructive", title: "Arquivo é obrigatório" });
        return;
    }
    if (activeTab === 'link' && !imageUrl) {
        toast({ variant: "destructive", title: "URL da imagem é obrigatória" });
        return;
    }

    setIsSubmitting(true);
    let finalImageUrl = imageUrl;
    let storagePath = `italosantos.com/photos-by-url/${Date.now()}_${title.replace(/\s/g, '_')}`;

    try {
      if (activeTab === 'upload' && file) {
        // Upload do arquivo
        storagePath = `italosantos.com/photos/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        finalImageUrl = await getDownloadURL(storageRef);
      }
      
      // Add photo metadata to Firestore
      await addDoc(collection(db, "photos"), {
        title,
        imageUrl: finalImageUrl,
        storagePath: (activeTab === 'upload' ? storagePath : 'external'), // Indica se foi upload ou link
        createdAt: Timestamp.now(),
      });
      
      toast({
        title: "Foto Adicionada!",
        description: "Sua nova foto foi salva com sucesso.",
      });
      
      resetForm();
      setIsDialogOpen(false);
      await fetchPhotos(); // Refresh the list
    } catch (error) {
      console.error("Error adding photo: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar foto",
        description: "Ocorreu um erro ao salvar a foto. Verifique as regras do Firebase Storage e as permissões de CORS se estiver usando um link.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm("Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.")) return;
    
    try {
      await deleteDoc(doc(db, "photos", photo.id));
      
      // Delete from Storage only if it was uploaded (not from an external link)
      if (photo.storagePath && photo.storagePath !== 'external') {
        const photoRef = ref(storage, photo.storagePath);
        await deleteObject(photoRef);
      }
      
      toast({
        title: "Foto Excluída",
        description: "A foto foi removida com sucesso.",
      });
      await fetchPhotos(); // Refresh the list
    } catch (error) {
      console.error("Error deleting photo: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir foto",
      });
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Fotos</h1>
        <div className="ml-auto flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Foto
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Foto</DialogTitle>
                    <DialogDescription>
                        Faça o upload de uma nova foto para sua galeria a partir de um arquivo ou um link.
                    </DialogDescription>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" placeholder="Ex: Ensaio na Praia" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2"/>Upload</TabsTrigger>
                        <TabsTrigger value="link"><LinkIcon className="h-4 w-4 mr-2"/>Link Externo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                         <div className="grid grid-cols-4 items-center gap-4 pt-4">
                            <Label htmlFor="file" className="text-right">Arquivo</Label>
                            <Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" />
                        </div>
                    </TabsContent>
                    <TabsContent value="link">
                         <div className="grid grid-cols-4 items-center gap-4 pt-4">
                            <Label htmlFor="imageUrl" className="text-right">URL</Label>
                            <Input id="imageUrl" placeholder="https://exemplo.com/imagem.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="col-span-3" />
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" onClick={handleAddPhoto} disabled={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar Foto"}
                    </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Galeria de Fotos</CardTitle>
          <CardDescription>
            Gerencie as fotos exibidas no seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando fotos...</p>
          ) : photos.length === 0 ? (
            <p className="text-muted-foreground text-center">Nenhuma foto adicionada ainda.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative">
                    <Image
                        alt={photo.title}
                        className="aspect-square w-full rounded-md object-cover"
                        height="200"
                        src={photo.imageUrl}
                        data-ai-hint="gallery image"
                        width="200"
                    />
                    <div className="absolute inset-0 bg-black/70 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between">
                        <p className="text-sm font-bold">{photo.title}</p>
                        <Button variant="destructive" size="sm" className="mt-1 h-7 text-xs self-end" onClick={() => handleDeletePhoto(photo)}>
                            <Trash2 className="h-3 w-3 mr-1"/> Excluir
                        </Button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
