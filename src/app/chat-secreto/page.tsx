
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  senderId: 'user' | 'admin';
  timestamp: Timestamp | null;
}

// Para esta demo, o ID do chat é fixo. Em uma aplicação real, isso seria dinâmico.
const CHAT_ID = "secret-chat-1"; 

export default function ChatSecretoPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<'user' | 'admin'>('user'); // Simula o usuário atual
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const db = getFirestore(firebaseApp);

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
  
  // Função para simular a troca de usuário (para fins de teste)
  const toggleUser = () => {
    setCurrentUser(currentUser === 'user' ? 'admin' : 'user');
  };

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-primary/20">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft />
            </Button>
            <CardTitle className="text-xl text-primary text-shadow-neon-red-light">
                Chat Secreto
            </CardTitle>
            <Button variant="outline" onClick={toggleUser} className="text-xs h-8">
              Mudar para {currentUser === 'user' ? 'Admin' : 'Usuário'}
            </Button>
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
        <CardFooter className="border-t border-primary/20 p-4">
            <div className="flex w-full items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="Digite sua mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-background/50 border-primary/30 focus:shadow-neon-red-light"
                    disabled={isSending}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={isSending || newMessage.trim() === ''}
                    className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong"
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Enviar</span>
                </Button>
            </div>
        </CardFooter>
      </Card>
    </main>
  );
}
