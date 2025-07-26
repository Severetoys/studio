
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Phone, Mail, MapPin, Image as ImageIcon } from "lucide-react";
import { Separator } from '@/components/ui/separator';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    
    // State for user profile data
    const [name, setName] = useState("Italo Santos");
    const [phone, setPhone] = useState("5521990479104");
    const [email, setEmail] = useState("pix@italosantos.com");
    const [address, setAddress] = useState("Avenida Paulista, São Paulo, SP, Brasil");

    // State for images
    const [profilePictureUrl, setProfilePictureUrl] = useState("https://placehold.co/150x150.png");
    const [coverPhotoUrl, setCoverPhotoUrl] = useState("https://placehold.co/1200x400.png");
    
    const [galleryPhotos, setGalleryPhotos] = useState(
        Array(7).fill("").map((_, i) => ({
            id: `gallery-${i+1}`,
            url: "https://placehold.co/400x600.png"
        }))
    );

    const handleSaveChanges = () => {
        // Here you would typically save the data to your backend (e.g., Firestore)
        console.log("Saving data:", {
            name,
            phone,
            email,
            address,
            profilePictureUrl,
            coverPhotoUrl,
            galleryPhotos
        });
        
        toast({
            title: "Configurações Salvas!",
            description: "Suas informações foram atualizadas com sucesso.",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Configurações do Perfil</h1>
                <Button onClick={handleSaveChanges}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                    <CardDescription>Estes dados serão exibidos publicamente no seu site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2"><User /> Nome de Exibição</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail /> Email de Contato</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2"><Phone /> Telefone (WhatsApp)</Label>
                            <Input id="phone" placeholder="Ex: 5521999998888" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2"><MapPin /> Endereço (para o mapa)</Label>
                            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Imagens do Perfil</CardTitle>
                    <CardDescription>Atualize a foto de perfil e a imagem de capa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="profilePicture" className="flex items-center gap-2"><ImageIcon /> URL da Foto de Perfil</Label>
                        <Input id="profilePicture" placeholder="https://.../sua-foto.jpg" value={profilePictureUrl} onChange={(e) => setProfilePictureUrl(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coverPhoto" className="flex items-center gap-2"><ImageIcon /> URL da Foto de Capa</Label>
                        <Input id="coverPhoto" placeholder="https://.../sua-capa.jpg" value={coverPhotoUrl} onChange={(e) => setCoverPhotoUrl(e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Galerias da Página Inicial</CardTitle>
                    <CardDescription>Gerencie as 7 galerias de fotos que aparecem no rodapé da página inicial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {galleryPhotos.map((photo, index) => (
                        <div key={photo.id} className="space-y-2">
                            <Label htmlFor={photo.id}>URL da Imagem para a Galeria {index + 1}</Label>
                            <Input 
                                id={photo.id} 
                                value={photo.url} 
                                onChange={(e) => {
                                    const newPhotos = [...galleryPhotos];
                                    newPhotos[index].url = e.target.value;
                                    setGalleryPhotos(newPhotos);
                                }}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
