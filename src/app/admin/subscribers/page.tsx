
"use client";

import { MoreHorizontal, PlusCircle, Star, Trash2 } from "lucide-react";
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
  DropdownMenuSeparator
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

const subscribers = [
  {
    id: "user-001",
    name: "João Silva",
    email: "joao.silva@example.com",
    avatar: "https://placehold.co/100x100.png?text=JS",
    status: "Ativo",
    plan: "Mensal",
    joinDate: "2024-07-15",
  },
  {
    id: "user-002",
    name: "Maria Oliveira",
    email: "maria.o@example.com",
    avatar: "https://placehold.co/100x100.png?text=MO",
    status: "Trial",
    plan: "Anual",
    joinDate: "2024-06-28",
  },
  {
    id: "user-003",
    name: "Carlos Pereira",
    email: "carlos.p@example.com",
    avatar: "https://placehold.co/100x100.png?text=CP",
    status: "Inativo",
    plan: "Mensal",
    joinDate: "2024-05-10",
  },
];

export default function AdminSubscribersPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Assinantes</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Assinantes</CardTitle>
          <CardDescription>
            Visualize, adicione trials e remova assinantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Plano</TableHead>
                <TableHead className="hidden md:table-cell">Data de Inscrição</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar>
                      <AvatarImage src={subscriber.avatar} alt={subscriber.name} data-ai-hint="profile avatar" />
                      <AvatarFallback>{subscriber.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{subscriber.name}</TableCell>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>
                    <Badge variant={subscriber.status === 'Ativo' ? 'default' : subscriber.status === 'Trial' ? 'secondary' : 'destructive'}>
                      {subscriber.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{subscriber.plan}</TableCell>
                  <TableCell className="hidden md:table-cell">{subscriber.joinDate}</TableCell>
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
                        <DropdownMenuItem>
                          <Star className="mr-2 h-4 w-4" />
                          Conceder TRIAL FREE
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                           Remover Assinante
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
