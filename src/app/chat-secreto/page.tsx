
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Video, MapPin } from 'lucide-react';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { app as firebaseApp } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { translateText, detectLanguage } from '@/ai/flows/translation-flow';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

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
        const randomId = Math.random().toString(36).substring(2, 8);
        chatId = `secret-chat-${randomId}`;
        localStorage.setItem('secretChatId', chatId);
    }
    return chatId;
};

export default function ChatSecretoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState('');
  const currentUser = 'user';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const db = getFirestore(firebaseApp);
  const [userLanguage, setUserLanguage] = useState('pt'); // Default to PT

  useEffect(() => {
    const id = getOrCreateChatId();
    setChatId(id);
    if (typeof window !== 'undefined') {
        const lang = navigator.language.split('-')[0] || 'pt';
        setUserLanguage(lang);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const messagesCollection = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
       for (const doc of querySnapshot.docs) {
          const msgData = { id: doc.id, ...doc.data() } as Message;
          msgs.push(msgData);
      }
      setMessages(msgs);
    }, (error) => {
      console.error("Erro ao carregar mensagens:", error);
    });

    return () => unsubscribe();
  }, [db, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, originalText?: string) => {
    if (text.trim() === '' || isSending || !chatId) return;
    setIsSending(true);

    try {
      const chatDocRef = doc(db, 'chats', chatId);
      const messagesCollection = collection(chatDocRef, 'messages');

      const chatDoc = await getDoc(chatDocRef);
      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, { createdAt: serverTimestamp(), userLanguage: userLanguage });
      }

      const messagePayload: any = {
        text: text.trim(),
        senderId: currentUser,
        timestamp: serverTimestamp(),
      };

      if (originalText) {
          messagePayload.originalText = originalText;
      }
      
      await addDoc(messagesCollection, messagePayload);

      setNewMessage('');
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({ variant: 'destructive', title: 'Erro ao Enviar', description: 'Não foi possível enviar a mensagem.' });
    } finally {
      setIsSending(false);
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isSending || !chatId) return;
    
    setIsSending(true);
    const originalMsg = newMessage.trim();
    try {
        const translated = await translateText({ text: originalMsg, targetLanguage: 'pt' });
        await sendMessage(translated.translatedText, originalMsg);
    } catch(e) {
        console.error("Translation failed, sending original.", e);
        await sendMessage(originalMsg, originalMsg);
    } finally {
        setIsSending(false);
    }
  };
  
  const handleSendLocation = () => {
    if (!navigator.geolocation) {
        toast({ variant: 'destructive', title: 'Geolocalização não suportada'});
        return;
    }
    toast({ title: 'Obtendo localização...'});
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const locationMessage = `Minha localização atual: ${locationUrl}`;

        const translated = await translateText({ text: locationMessage, targetLanguage: 'pt' });
        await sendMessage(translated.translatedText, locationMessage);
    }, (error) => {
        toast({ variant: 'destructive', title: 'Não foi possível obter a localização', description: error.message });
    });
  };

  const handleVideoCall = () => {
      toast({
          title: 'Funcionalidade em desenvolvimento',
          description: 'A chamada de vídeo ainda não está disponível.'
      });
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
                         "max-w-xs md:max-w-md rounded-lg px-4 py-2",
                         msg.senderId === currentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                     )}>
                         <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                           {msg.senderId === 'user' && msg.originalText ? msg.originalText : msg.text}
                         </p>
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
                <Button variant="ghost" size="icon" onClick={handleVideoCall} disabled={isSending}>
                    <Video />
                    <span className="sr-only">Chamada de Vídeo</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSendLocation} disabled={isSending}>
                    <MapPin />
                    <span className="sr-only">Enviar Localização</span>
                </Button>
                <Textarea
                    placeholder="Digite sua mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    className="flex-1 bg-background/50 border-primary/30 focus:shadow-neon-red-light min-h-[40px] h-10 max-h-24 resize-none"
                    disabled={isSending}
                    rows={1}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    onClick={handleSendMessage} 
                    disabled={isSending || newMessage.trim() === ''}
                    className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-neon-red-light hover:shadow-neon-red-strong self-end"
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
