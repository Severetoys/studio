
"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { translateText } from '@/ai/flows/translation-flow';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Message {
  id: string;
  text: string;
  senderId: 'user' | 'admin';
  timestamp: Timestamp | null;
  originalText?: string;
}

interface ChatData {
    userLanguage?: string;
}

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;

  const db = getFirestore(firebaseApp);
  const currentUser = 'admin';

  useEffect(() => {
    if (!chatId) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    const chatDocRef = doc(db, 'chats', chatId);
    const messagesCollection = collection(chatDocRef, 'messages');
    
    // Subscribe to chat metadata
    const unsubChat = onSnapshot(chatDocRef, (doc) => {
        setChatData(doc.data() as ChatData);
    });

    // Subscribe to messages
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));
    const unsubMessages = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setIsLoading(false);
    }, (error) => {
        console.error("Erro ao buscar mensagens: ", error);
        setIsLoading(false);
    });

    return () => {
        unsubChat();
        unsubMessages();
    };
  }, [db, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isSending || !chatId) return;

    setIsSending(true);
    
    try {
      const chatDocRef = doc(db, 'chats', chatId);
      const messagesCollection = collection(chatDocRef, 'messages');

      // Garantia de que o chat exista (caso o admin inicie)
      if (!chatData) {
        await setDoc(chatDocRef, { createdAt: serverTimestamp() });
      }

      // Admin always sends in Portuguese.
      await addDoc(messagesCollection, {
        text: newMessage.trim(),
        senderId: currentUser,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!chatId) {
    return (
        <Card className="w-full h-[85vh] flex flex-col items-center justify-center">
            <CardContent>
                <p className="text-muted-foreground">ID do chat inválido.</p>
            </CardContent>
        </Card>
    );
  }

  const getChatParticipantName = (chatId: string) => {
    if (chatId.startsWith('secret-chat-')) {
      return `Cliente ${chatId.substring(12)}`;
    }
    return chatId;
  }

  return (
    <Card className="w-full h-[85vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/conversations')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">
                Chat com {getChatParticipantName(chatId)}
                {chatData?.userLanguage && <span className="text-sm text-muted-foreground ml-2">({chatData.userLanguage})</span>}
            </CardTitle>
            <div className="w-9 h-9" />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
             <TooltipProvider>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser ? 'justify-end' : 'justify-start')}>
                                {msg.senderId !== currentUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{msg.senderId === 'admin' ? 'A' : 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={cn(
                                            "max-w-xs md:max-w-md rounded-lg px-4 py-2",
                                            msg.senderId === currentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                                        )}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className="text-xs text-right opacity-70 mt-1">
                                                {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Enviando...'}
                                            </p>
                                        </div>
                                    </TooltipTrigger>
                                    {msg.originalText && (
                                        <TooltipContent>
                                            <p>Original: "{msg.originalText}"</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>

                                {msg.senderId === currentUser && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{currentUser === 'admin' ? 'A' : 'U'}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
             </TooltipProvider>
        </CardContent>
        <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="Digite sua mensagem (será traduzida para o cliente)..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                    disabled={isSending || isLoading}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={isSending || isLoading || newMessage.trim() === ''}
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Enviar</span>
                </Button>
            </div>
        </CardFooter>
      </Card>
  );
}
