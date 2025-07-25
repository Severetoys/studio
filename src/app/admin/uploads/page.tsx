"use client";

import { useState, useEffect, useRef } from 'react';
import { UploadCloud, ClipboardCopy, Link as LinkIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, listAll, deleteObject, getMetadata, getDownloadURL } from "firebase/storage";
import { app as firebaseApp } from '@/lib/firebase';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import axios from 'axios';

interface UploadedFile {
    name: string;
    url: string;
    fullPath: string;
    size: number;
    createdAt: string;
}

export default function AdminUploadsPage() {
    const { toast } = useToast();
    const storage = getStorage(firebaseApp);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);

    const fetchUploadedFiles = async () => {
        setIsLoadingFiles(true);
        try {
            const storageRef = ref(storage, 'italosantos.com/general-uploads/');
            const result = await listAll(storageRef);
            const filesData = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    const metadata = await getMetadata(itemRef);
                    return {
                        name: itemRef.name,
                        url,
                        fullPath: itemRef.fullPath,
                        size: metadata.size,
                        createdAt: metadata.timeCreated
                    };
                })
            );
            filesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setUploadedFiles(filesData);
        } catch (error) {
            console.error("Erro ao buscar arquivos:", error);
            toast({ variant: "destructive", title: "Falha ao carregar arquivos" });
        } finally {
            setIsLoadingFiles(false);
        }
    };

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({ variant: "destructive", title: "Nenhum arquivo selecionado" });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            toast({
                title: "Upload Concluído!",
                description: "Seu arquivo foi enviado com sucesso.",
            });
            await fetchUploadedFiles();

        } catch (error: any) {
            console.error("Erro no upload: ", error);
            const errorMessage = error.response?.data?.error || "Não foi possível enviar o arquivo.";
            toast({ variant: "destructive", title: "Erro no Upload", description: errorMessage });
        } finally {
             if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setFile(null);
            setIsUploading(false);
            setUploadProgress(0);
        }
    };
    
    const handleImportFromLink = () => {
        if(!linkUrl) {
            toast({ variant: "destructive", title: "URL Inválida", description: "Por favor, insira um link válido." });
            return;
        }
        toast({
            title: "Funcionalidade em desenvolvimento",
            description: "A importação de mídias por link ainda não foi implementada.",
        });
        console.log("Tentativa de importação da URL:", linkUrl);
    }

    const handleDelete = async (filePath: string) => {
        if (!confirm("Tem certeza que deseja excluir este arquivo? A ação é irreversível.")) return;
        try {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            toast({ title: "Arquivo Excluído!" });
            await fetchUploadedFiles();
        } catch (error) {
             console.error("Erro ao excluir: ", error);
             toast({ variant: "destructive", title: "Erro ao Excluir" });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Link copiado!" });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UploadCloud className="h-6 w-6" />
                        Gerenciador de Mídias
                    </CardTitle>
                    <CardDescription>
                       Envie arquivos do seu computador ou importe através de um link externo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
                            <TabsTrigger value="link">Importar via Link</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload">
                            <div className="space-y-4 pt-4">
                                <div>
                                    <Label htmlFor="file-upload">Selecione um arquivo</Label>
                                    <Input ref={fileInputRef} id="file-upload" type="file" onChange={handleFileChange} className="mt-1" disabled={isUploading}/>
                                </div>
                                {isUploading && (
                                    <div className="space-y-2">
                                        <Progress value={uploadProgress} className="w-full" />
                                        <p className="text-sm text-muted-foreground text-center">{uploadProgress}% concluído</p>
                                    </div>
                                )}
                                <Button onClick={handleUpload} disabled={!file || isUploading}>
                                    {isUploading ? `Enviando... ${uploadProgress}%` : "Enviar Arquivo"}
                                </Button>
                            </div>
                        </TabsContent>
                        <TabsContent value="link">
                            <div className="space-y-4 pt-4">
                                <div>
                                    <Label htmlFor="link-url">URL da Mídia</Label>
                                    <Input id="link-url" type="url" placeholder="https://exemplo.com/imagem.jpg" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="mt-1" />
                                </div>
                                <Button onClick={handleImportFromLink} disabled={!linkUrl}>
                                    <LinkIcon className="mr-2 h-4 w-4"/>
                                    Importar via Link
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Arquivos Enviados</CardTitle>
                    <CardDescription>Lista de arquivos na pasta 'general-uploads'.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingFiles ? (
                        <p>Carregando arquivos...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Arquivo</TableHead>
                                    <TableHead>Tamanho</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uploadedFiles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum arquivo encontrado.</TableCell>
                                    </TableRow>
                                ) : (
                                    uploadedFiles.map((f) => (
                                        <TableRow key={f.fullPath}>
                                            <TableCell className="font-medium truncate max-w-xs" title={f.name}>{f.name}</TableCell>
                                            <TableCell>{(f.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                                            <TableCell>{format(new Date(f.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(f.url)}>
                                                    <ClipboardCopy className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDelete(f.fullPath)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
