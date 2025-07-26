
"use client";

import { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, deleteUser, type RegisteredUser } from './actions';

export default function AdminSubscribersPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscribers = async () => {
      setIsLoading(true);
      try {
          const users = await getAllUsers();
          setSubscribers(users);
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Erro ao buscar assinantes', description: error.message });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDeleteSubscriber = async (userId: string, storagePath: string) => {
    if (!confirm("Tem certeza que deseja excluir este assinante? Esta ação é irreversível e removerá todos os seus dados e a foto de autenticação.")) {
        return;
    }

    try {
        const result = await deleteUser({ userId, storagePath });
        if (result.success) {
            toast({ title: 'Assinante Removido', description: result.message });
            await fetchSubscribers();
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro ao remover assinante', description: error.message });
    }
  };
  
  const getAvatarFallback = (name: string) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length > 1) {
          return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Assinantes</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Assinantes</CardTitle>
          <CardDescription>
            Visualize e remova assinantes que se cadastraram com Face ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Avatar
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Cadastro</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                          Nenhum assinante encontrado.
                      </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar>
                          <AvatarImage src={subscriber.imageUrl} alt={subscriber.name} data-ai-hint="profile avatar" />
                          <AvatarFallback>{getAvatarFallback(subscriber.name)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{subscriber.name || 'Nome não informado'}</TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{subscriber.phone || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString() : 'N/A'}
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
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.storagePath)} 
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover Assinante
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

