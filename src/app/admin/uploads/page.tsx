
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, UploadCloud, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from "firebase/storage";
import { app as firebaseApp } from '@/lib/firebase';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

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

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);

    const fetchUploadedFiles = async () => {
        setIsLoadingFiles(true);
        try {
            const storageRef = ref(storage, 'general-uploads/');
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
            // Sort files by creation date, newest first
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
        const storageRef = ref(storage, `general-uploads/${Date.now()}_${file.name}`);

        try {
            // Firebase SDK for web v9+ doesn't have a built-in progress tracker for uploadBytes.
            // For a simple progress bar, we'll simulate it. For real progress, we'd need uploadBytesResumable.
            // Let's keep it simple as a visual indicator.
            setUploadProgress(50);
            await uploadBytes(storageRef, file);
            setUploadProgress(100);

            const downloadURL = await getDownloadURL(storageRef);
            
            toast({
                title: "Upload Concluído!",
                description: "Seu arquivo foi enviado com sucesso.",
            });

            await fetchUploadedFiles(); // Refresh the file list
            setFile(null); // Reset file input
        } catch (error) {
            console.error("Erro no upload: ", error);
            toast({ variant: "destructive", title: "Erro no Upload", description: "Não foi possível enviar o arquivo."});
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

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
                        Upload de Arquivos
                    </CardTitle>
                    <CardDescription>
                        Envie arquivos diretamente para o seu Firebase Storage. Eles ficarão disponíveis na pasta 'general-uploads'.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="file-upload">Selecione um arquivo</Label>
                        <Input id="file-upload" type="file" onChange={handleFileChange} className="mt-1" />
                    </div>
                    {isUploading && <Progress value={uploadProgress} className="w-full" />}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? "Enviando..." : "Enviar Arquivo"}
                    </Button>
                </CardFooter>
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
