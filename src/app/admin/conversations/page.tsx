
"use client";

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, MessageSquare } from 'lucide-react';
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
    lastMessage: LastMessage | null;
}

export default function AdminConversationsPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        setIsLoading(true);
        const chatsCollectionRef = collection(db, 'chats');

        const unsubscribe = onSnapshot(chatsCollectionRef, async (querySnapshot) => {
            const chatsData: Chat[] = [];
            
            for (const doc of querySnapshot.docs) {
                const messagesCollectionRef = collection(doc.ref, 'messages');
                const lastMessageQuery = query(messagesCollectionRef, orderBy('timestamp', 'desc'), limit(1));
                const lastMessageSnapshot = await getDocs(lastMessageQuery);

                let lastMessage: LastMessage | null = null;
                if (!lastMessageSnapshot.empty) {
                    const lastMessageDoc = lastMessageSnapshot.docs[0];
                    lastMessage = lastMessageDoc.data() as LastMessage;
                }

                chatsData.push({
                    id: doc.id,
                    lastMessage,
                });
            }
            
            // Sort chats by last message timestamp
            chatsData.sort((a, b) => {
                if (!a.lastMessage) return 1;
                if (!b.lastMessage) return -1;
                return b.lastMessage.timestamp.toMillis() - a.lastMessage.timestamp.toMillis();
            });

            setChats(chatsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar conversas: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db]);

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Conversas Ativas</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Caixa de Entrada</CardTitle>
                    <CardDescription>Visualize e responda as mensagens dos seus clientes.</CardDescription>
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
                            <p className="mt-1 text-sm text-muted-foreground">Quando um cliente iniciar um chat, ele aparecerá aqui.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Avatar</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Última Mensagem</TableHead>
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
                                            <div className="font-medium">{chat.id.replace('secret-chat-', '')}</div>
                                            <div className="text-sm text-muted-foreground">ID: {chat.id}</div>
                                        </TableCell>
                                        <TableCell className="max-w-sm truncate">
                                            <span className="font-semibold">{chat.lastMessage?.senderId === 'admin' ? 'Você: ' : ''}</span>
                                            {chat.lastMessage?.text || 'Nenhuma mensagem ainda'}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-xs">
                                            {chat.lastMessage ? formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: true, locale: ptBR }) : '-'}
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
