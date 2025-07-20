
"use client";

import Image from "next/image";
import { PlusCircle, File, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Produtos</h1>
        <div className="ml-auto flex items-center gap-2">
            <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Adicionar Produto
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
                <DialogDescription>
                    Faça o upload de uma nova foto ou vídeo para sua loja.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                    Título
                    </Label>
                    <Input id="title" placeholder="Ex: Ensaio Sensual" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                    Descrição
                    </Label>
                    <Textarea id="description" placeholder="Descreva o conteúdo..." className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                    Preço (BRL)
                    </Label>
                    <Input id="price" type="number" placeholder="99.90" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file" className="text-right">
                    Arquivo
                    </Label>
                    <Input id="file" type="file" className="col-span-3" />
                </div>
                </div>
                <DialogFooter>
                <Button type="submit">Salvar Produto</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Meus Produtos</CardTitle>
          <CardDescription>
            Gerencie suas fotos e vídeos exclusivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">
                  Vendas
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Criado em
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt="Product image"
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src="https://placehold.co/64x64.png"
                    data-ai-hint="product image"
                    width="64"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Vídeo Exclusivo: Bastidores
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Ativo</Badge>
                </TableCell>
                <TableCell>R$49,99</TableCell>
                <TableCell className="hidden md:table-cell">
                  25
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  2023-07-12 10:42 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {/* Outras linhas podem ser adicionadas aqui */}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-1</strong> de <strong>1</strong> produtos
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
