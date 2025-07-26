
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Phone, Mail, MapPin, Image as ImageIcon, Loader2 } from "lucide-react";
import { getProfileSettings, saveProfileSettings, type ProfileSettings } from './actions';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    
    const [settings, setSettings] = useState<ProfileSettings>({
        name: "Italo Santos",
        phone: "5521990479104",
        email: "pix@italosantos.com",
        address: "Avenida Paulista, São Paulo, SP, Brasil",
        profilePictureUrl: "https://placehold.co/150x150.png",
        coverPhotoUrl: "https://placehold.co/1200x400.png",
        galleryPhotos: Array(7).fill({ url: "https://placehold.co/400x600.png" }),
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            try {
                const loadedSettings = await getProfileSettings();
                if (loadedSettings) {
                    // Ensure galleryPhotos has 7 items, padding with placeholders if needed
                    const gallery = loadedSettings.galleryPhotos || [];
                    while (gallery.length < 7) {
                        gallery.push({ url: "https://placehold.co/400x600.png" });
                    }
                    loadedSettings.galleryPhotos = gallery.slice(0, 7);
                    setSettings(loadedSettings);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                toast({
                    variant: "destructive",
                    title: "Erro ao carregar configurações",
                });
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [toast]);
    
    const handleInputChange = (field: keyof ProfileSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleGalleryChange = (index: number, value: string) => {
        setSettings(prev => {
            const newGallery = [...(prev.galleryPhotos || [])];
            newGallery[index] = { ...newGallery[index], url: value };
            return { ...prev, galleryPhotos: newGallery };
        });
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await saveProfileSettings(settings);
            toast({
                title: "Configurações Salvas!",
                description: "Suas informações foram atualizadas com sucesso.",
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Erro ao Salvar",
                description: "Não foi possível salvar as configurações.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2 text-muted-foreground">Carregando configurações...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Configurações do Perfil</h1>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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
                            <Input id="name" value={settings.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail /> Email de Contato</Label>
                            <Input id="email" type="email" value={settings.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2"><Phone /> Telefone (WhatsApp)</Label>
                            <Input id="phone" placeholder="Ex: 5521999998888" value={settings.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2"><MapPin /> Endereço (para o mapa)</Label>
                            <Input id="address" value={settings.address} onChange={(e) => handleInputChange('address', e.target.value)} />
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
                        <Input id="profilePicture" placeholder="https://.../sua-foto.jpg" value={settings.profilePictureUrl} onChange={(e) => handleInputChange('profilePictureUrl', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="coverPhoto" className="flex items-center gap-2"><ImageIcon /> URL da Foto de Capa</Label>
                        <Input id="coverPhoto" placeholder="https://.../sua-capa.jpg" value={settings.coverPhotoUrl} onChange={(e) => handleInputChange('coverPhotoUrl', e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Galerias da Página Inicial</CardTitle>
                    <CardDescription>Gerencie as 7 galerias de fotos que aparecem no rodapé da página inicial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.galleryPhotos.map((photo, index) => (
                        <div key={`gallery-${index}`} className="space-y-2">
                            <Label htmlFor={`gallery-${index}`}>URL da Imagem para a Galeria {index + 1}</Label>
                            <Input 
                                id={`gallery-${index}`} 
                                value={photo.url} 
                                onChange={(e) => handleGalleryChange(index, e.target.value)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
