
"use client";

import { useState, useEffect, useRef } from 'react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  senderId: 'user' | 'admin';
  timestamp: Timestamp | null;
}

// Para esta demo, o ID do chat é fixo. Em uma aplicação real, isso seria dinâmico.
const CHAT_ID = "secret-chat-1"; 

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const db = getFirestore(firebaseApp);
  const currentUser = 'admin'; // No painel admin, sempre será o admin.

  useEffect(() => {
    const messagesCollection = collection(db, 'chats', CHAT_ID, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isSending) return;

    setIsSending(true);
    const messagesCollection = collection(db, 'chats', CHAT_ID, 'messages');

    try {
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

  return (
    <Card className="w-full h-[85vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-xl">
                Chat com Cliente
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser ? 'justify-end' : 'justify-start')}>
                     {msg.senderId !== currentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{msg.senderId === 'admin' ? 'A' : 'U'}</AvatarFallback>
                        </Avatar>
                     )}
                     <div className={cn(
                         "max-w-xs md:max-w-md rounded-lg px-4 py-2 text-white",
                         msg.senderId === currentUser ? 'bg-primary' : 'bg-secondary'
                     )}>
                         <p className="text-sm">{msg.text}</p>
                         <p className="text-xs text-right opacity-70 mt-1">
                             {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Enviando...'}
                         </p>
                     </div>
                     {msg.senderId === currentUser && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{currentUser === 'admin' ? 'A' : 'U'}</AvatarFallback>
                        </Avatar>
                     )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="Digite sua mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                    disabled={isSending}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={isSending || newMessage.trim() === ''}
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Enviar</span>
                </Button>
            </div>
        </CardFooter>
      </Card>
  );
}
