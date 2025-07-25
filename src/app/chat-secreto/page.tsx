
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Video, User, Loader2 } from 'lucide-react';
import { auth, database } from '@/lib/firebase';
import { ref, set, onValue, push, onDisconnect, serverTimestamp, DataSnapshot, query, orderByChild, off } from "firebase/database";
import { signInAnonymously, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: number;
}

interface OnlineUser {
    isOnline: boolean;
    displayName?: string;
    lastOnline?: number;
}

export default function ChatSecretoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. Autenticação Anônima ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoading(false);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Erro no login anônimo:", error);
          toast({ variant: 'destructive', title: 'Falha na Autenticação', description: 'Não foi possível entrar no chat secreto.' });
          setIsLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, [toast]);

  // --- 2. Gerenciamento de Presença ---
  useEffect(() => {
    if (!currentUser) return;

    const userStatusDatabaseRef = ref(database, '/users/' + currentUser.uid);
    const presenceRef = ref(database, '.info/connected');

    const listener = onValue(presenceRef, (snap: DataSnapshot) => {
        if (snap.val() === false) return;

        onDisconnect(userStatusDatabaseRef).set({
            isOnline: false,
            lastOnline: serverTimestamp(),
            displayName: `Anônimo-${currentUser.uid.substring(0, 4)}`,
        }).catch((err) => console.error("Could not establish onDisconnect event", err));

        set(userStatusDatabaseRef, {
            isOnline: true,
            lastOnline: serverTimestamp(),
            displayName: `Anônimo-${currentUser.uid.substring(0, 4)}`,
        });
    });

    // Cleanup function for the listener
    return () => {
      // The listener should be detached using the same reference and event type
      off(presenceRef, 'value', listener);
    };
  }, [currentUser]);
  

  // --- 3. Funcionalidade do Chat ---
  useEffect(() => {
    if (!currentUser) return;

    // --- Ouvinte para mensagens do chat ---
    const chatMessagesRef = ref(database, 'secretChat/messages');
    const messagesQuery = query(chatMessagesRef, orderByChild('timestamp'));
    const messagesUnsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        const msg = childSnapshot.val();
        messagesData.push({ id: childSnapshot.key!, ...msg });
      });
      setMessages(messagesData);
    });

    // --- Ouvinte para usuários online ---
    const usersRef = ref(database, 'users');
    const usersUnsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val() || {};
      setOnlineUsers(usersData);
    });

    return () => {
      messagesUnsubscribe();
      usersUnsubscribe();
    };
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || isSending || !currentUser) return;
    
    setIsSending(true);
    const chatMessagesRef = ref(database, 'secretChat/messages');
    const newMsgRef = push(chatMessagesRef);

    try {
      await set(newMsgRef, {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({ variant: 'destructive', title: 'Erro ao Enviar', description: 'Não foi possível enviar a mensagem.' });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleVideoCall = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A chamada de vídeo será implementada em breve.",
    });
  }

  const getSenderInitial = (senderId: string) => {
    const user = onlineUsers[senderId];
    if(user?.displayName) {
        return user.displayName.substring(0, 2).toUpperCase();
    }
    return senderId.substring(0, 2).toUpperCase();
  }
  
  if (isLoading) {
    return (
        <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
            <p className="text-muted-foreground mt-4">Conectando ao chat secreto...</p>
        </main>
    )
  }

  return (
    <main className="flex flex-1 w-full flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-card/90 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-primary/20">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft />
            </Button>
            <div className="text-center">
                <CardTitle className="text-xl text-primary text-shadow-neon-red-light">
                    Chat Secreto
                </CardTitle>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <User className="h-3 w-3" />
                    {Object.values(onlineUsers).filter(u => u.isOnline).length} online
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleVideoCall}>
                <Video />
            </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start')}>
                    {msg.senderId !== currentUser?.uid && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getSenderInitial(msg.senderId)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        "max-w-xs md:max-w-md rounded-lg px-4 py-2",
                        msg.senderId === currentUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}>
                        <p className="text-sm font-semibold">{onlineUsers[msg.senderId]?.displayName || `Anônimo-${msg.senderId.substring(0,4)}`}</p>
                        <p className="text-sm mt-1" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {msg.text}
                        </p>
                        <p className="text-xs text-right opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Enviando...'}
                        </p>
                    </div>
                    {msg.senderId === currentUser?.uid && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getSenderInitial(msg.senderId)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t border-primary/20 p-4">
            <div className="flex w-full items-center space-x-2">
                <Textarea
                    placeholder="Digite sua mensagem..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    className="flex-1 bg-background/50 border-primary/30 focus:shadow-neon-red-light min-h-[40px] h-10 max-h-24 resize-none"
                    disabled={isSending}
                    rows={1}
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    onClick={sendMessage} 
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
