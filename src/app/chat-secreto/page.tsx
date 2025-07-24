
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { translateText } from '@/ai/flows/translation-flow';

interface Message {
  id: string;
  text: string;
  senderId: 'user' | 'admin';
  timestamp: Timestamp | null;
  originalText?: string;
}

const getOrCreateChatId = (): string => {
    if (typeof window === 'undefined') {
        return '';
    }
    let chatId = localStorage.getItem('secretChatId');
    if (!chatId) {
        // Gera um ID aleatório mais descritivo
        const randomId = Math.random().toString(36).substring(2, 8);
        chatId = `secret-chat-${randomId}`;
        localStorage.setItem('secretChatId', chatId);
    }
    return chatId;
};

export default function ChatSecretoPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState('');
  const currentUser = 'user';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getFirestore(firebaseApp);
  const [userLanguage, setUserLanguage] = useState('en'); // Default language

  useEffect(() => {
    const id = getOrCreateChatId();
    setChatId(id);
    // Detect user's browser language
    if (typeof window !== 'undefined') {
        setUserLanguage(navigator.language.split('-')[0]);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const msgs: Message[] = [];
       for (const doc of querySnapshot.docs) {
          let msgData = { id: doc.id, ...doc.data() } as Message;

          // Se a mensagem for do admin, e eu (usuário) não falo português
          if (msgData.senderId === 'admin' && userLanguage !== 'pt') {
              const translated = await translateText({ text: msgData.text, targetLanguage: userLanguage });
              msgData.text = translated.translatedText;
          }
          msgs.push(msgData);
      }
      setMessages(msgs);
    }, (error) => {
      console.error("Erro ao carregar mensagens:", error);
    });

    return () => unsubscribe();
  }, [db, chatId, userLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isSending || !chatId) return;

    setIsSending(true);
    
    try {
        const chatDocRef = doc(db, 'chats', chatId);
        const messagesCollection = collection(chatDocRef, 'messages');

        const chatDoc = await getDoc(chatDocRef);
        // Se o chat não existir, cria-o com o idioma do usuário.
        if (!chatDoc.exists()) {
            await setDoc(chatDocRef, { createdAt: serverTimestamp(), userLanguage: userLanguage });
        }

        // Traduz a mensagem para o português antes de salvar
        const translated = await translateText({ text: newMessage.trim(), targetLanguage: 'pt' });

        await addDoc(messagesCollection, {
            text: translated.translatedText,
            originalText: newMessage.trim(),
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
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-primary/20">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft />
            </Button>
            <CardTitle className="text-xl text-primary text-shadow-neon-red-light">
                Chat Secreto
            </CardTitle>
            <div className="w-10"></div> {/* Espaço reservado para alinhar o título */}
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
