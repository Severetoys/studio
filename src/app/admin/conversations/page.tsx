
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, MessageSquare, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LastMessage {
    text: string;
    timestamp: Timestamp;
    senderId: string;
}

interface Chat {
    id: string;
    createdAt: Timestamp;
    lastMessage: LastMessage | null;
}

export default function AdminConversationsPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setIsLoading(true);
        const chatsCollectionRef = collection(db, 'chats');
        const q = query(chatsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (chatsSnapshot) => {
            const promises = chatsSnapshot.docs.map(async (chatDoc) => {
                const messagesCollectionRef = collection(chatDoc.ref, 'messages');
                const lastMessageQuery = query(messagesCollectionRef, orderBy('timestamp', 'desc'), limit(1));
                
                const lastMessageSnapshot = await getDocs(lastMessageQuery);
                let lastMessage: LastMessage | null = null;
                if (!lastMessageSnapshot.empty) {
                    const lastMessageDoc = lastMessageSnapshot.docs[0];
                    lastMessage = lastMessageDoc.data() as LastMessage;
                }

                return {
                    id: chatDoc.id,
                    createdAt: chatDoc.data().createdAt,
                    lastMessage,
                };
            });
            
            const chatsData = await Promise.all(promises);
            
            chatsData.sort((a, b) => {
                const timeA = a.lastMessage?.timestamp?.toMillis() || a.createdAt?.toMillis() || 0;
                const timeB = b.lastMessage?.timestamp?.toMillis() || b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });

            setChats(chatsData);
            setIsLoading(false);

        }, (error) => {
            console.error("Erro ao buscar conversas: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const getChatParticipantName = (chatId: string) => {
        if (chatId.startsWith('secret-chat-')) {
          return `Cliente ${chatId.substring(12)}`;
        }
        return chatId;
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Conversas Ativas</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Caixa de Entrada</CardTitle>
                    <CardDescription>Visualize e responda as mensagens dos seus clientes. Novos visitantes aparecerão aqui.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="text-center py-10">
                            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">Nenhuma conversa encontrada</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Quando um visitante ou cliente iniciar um chat, ele aparecerá aqui.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Avatar</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Última Atividade</TableHead>
                                    <TableHead className="text-right">Horário</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chats.map((chat) => (
                                    <TableRow key={chat.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/chat/${chat.id}`)}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarFallback>
                                                  {chat.lastMessage?.senderId === 'admin' ? 'A' : 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{getChatParticipantName(chat.id)}</div>
                                            <div className="text-sm text-muted-foreground">ID: {chat.id}</div>
                                        </TableCell>
                                        <TableCell className="max-w-sm truncate">
                                            {chat.lastMessage ? (
                                                <>
                                                    <span className="font-semibold">{chat.lastMessage.senderId === 'admin' ? 'Você: ' : ''}</span>
                                                    {chat.lastMessage.text}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground italic flex items-center gap-2"><UserCheck className="h-4 w-4 text-green-500" /> Novo visitante online</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">
                                            {chat.lastMessage ? formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : (chat.createdAt ? formatDistanceToNow(chat.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : '-')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">
                                                Abrir Chat <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
