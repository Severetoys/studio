
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
import Image from "next/image";


export default function AdminPhotosPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Fotos</h1>
        <div className="ml-auto flex items-center gap-2">
            <Dialog>
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
                        Faça o upload de uma nova foto para sua galeria.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" placeholder="Ex: Ensaio na Praia" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">Arquivo</Label>
                        <Input id="file" type="file" accept="image/*" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Salvar Foto</Button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Exemplo de foto na galeria */}
            <div className="group relative">
                <Image
                    alt="Gallery image"
                    className="aspect-square w-full rounded-md object-cover"
                    height="200"
                    src="https://placehold.co/200x200.png"
                    data-ai-hint="gallery image"
                    width="200"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-bold">Ensaio na Praia</p>
                    <Button variant="destructive" size="sm" className="mt-1 h-6 text-xs">Excluir</Button>
                </div>
            </div>
             {/* Adicionar mais fotos aqui */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
