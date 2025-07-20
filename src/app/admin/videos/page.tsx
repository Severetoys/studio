
"use client";

import { PlusCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function AdminVideosPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Vídeos</h1>
        <div className="ml-auto flex items-center gap-2">
            <Dialog>
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
                        Faça o upload de um novo vídeo para venda avulsa ou assinatura.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" placeholder="Ex: Bastidores Exclusivos" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Descrição</Label>
                        <Textarea id="description" placeholder="Descreva o conteúdo do vídeo..." className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Preço (Avulso)</Label>
                        <Input id="price" type="number" placeholder="49.90" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">Arquivo</Label>
                        <Input id="file" type="file" accept="video/*" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Salvar Vídeo</Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Exemplo de vídeo */}
                <Card>
                    <CardHeader className="p-0">
                         <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                            <Image src="https://placehold.co/600x400.png" alt="Thumbnail" width={600} height={400} className="w-full h-full object-cover" data-ai-hint="video thumbnail"/>
                         </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <h3 className="font-semibold">Bastidores Exclusivos</h3>
                        <p className="text-sm text-muted-foreground mt-1">Um olhar por trás das câmeras.</p>
                        <p className="text-sm font-bold text-primary mt-2">R$ 49.90</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="destructive" size="sm">Excluir</Button>
                    </CardFooter>
                </Card>
                {/* Adicionar mais vídeos aqui */}
            </div>
        </CardContent>
      </Card>
    </>
  );
}
