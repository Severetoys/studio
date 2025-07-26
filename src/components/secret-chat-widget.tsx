
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Loader2, MapPin } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, doc, setDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User as FirebaseUser } from "firebase/auth";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { translateText, detectLanguage } from '@/ai/flows/translation-flow';
import Image from 'next/image';

interface Message {
  id: string;
  senderId: string;
  text: string; // For admin, this is the user's language. For user, it's their original message.
  originalText?: string; // For user, this is their original message.
  timestamp: Timestamp;
  isLocation?: boolean;
}

const getOrCreateChatId = (): string => {
    if (typeof window === 'undefined') return '';
    let chatId = localStorage.getItem('secretChatId');
    if (!chatId) {
        const randomId = Math.random().toString(36).substring(2, 8);
        chatId = `secret-chat-${randomId}`;
        localStorage.setItem('secretChatId', chatId);
    }
    return chatId;
};

interface SecretChatWidgetProps {
    isOpen: boolean;
}

export default function SecretChatWidget({ isOpen }: SecretChatWidgetProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatId = useRef<string>('');

    useEffect(() => {
        if (isOpen && !chatId.current) {
            chatId.current = getOrCreateChatId();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                try {
                    const userCredential = await signInAnonymously(auth);
                    setCurrentUser(userCredential.user);
                } catch (error) {
                    console.error("Erro no login anônimo:", error);
                    toast({ variant: 'destructive', title: 'Falha na Autenticação do Chat' });
                }
            }
        });
        return () => unsubscribeAuth();
    }, [isOpen, toast]);

    useEffect(() => {
        if (!currentUser || !chatId.current || !isOpen) {
            if (!isOpen) setIsLoading(true); // Reset loading state when closed
            return;
        }

        setIsLoading(true);
        const chatDocRef = doc(db, 'chats', chatId.current);
        const messagesCollection = collection(chatDocRef, 'messages');
        const q = query(messagesCollection, orderBy('timestamp', 'asc'));

        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const msgs: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setIsLoading(false);
        }, (error) => {
            console.error("Erro ao buscar mensagens: ", error);
            setIsLoading(false);
        });

        return () => unsubscribeMessages();
    }, [currentUser, isOpen]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = useCallback(async (text: string, isLocation = false) => {
        const trimmedMessage = text.trim();
        if (trimmedMessage === '' || isSending || !currentUser || !chatId.current) return;
        
        setIsSending(true);
        const chatDocRef = doc(db, 'chats', chatId.current);
        const messagesCollection = collection(chatDocRef, 'messages');

        try {
            const userLanguage = (await detectLanguage({ text: trimmedMessage })).language || navigator.language.split('-')[0] || 'pt';
            
            await setDoc(chatDocRef, { 
                createdAt: serverTimestamp(),
                userLanguage: userLanguage,
            }, { merge: true });

            const translated = await translateText({ text: trimmedMessage, targetLanguage: 'pt' });

            await addDoc(messagesCollection, {
                text: translated.translatedText, // Always store the PT version for admin
                originalText: trimmedMessage, // Keep original for user's view
                senderId: currentUser.uid,
                timestamp: serverTimestamp(),
                isLocation,
            });

            if (!isLocation) {
                setNewMessage('');
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            toast({ variant: 'destructive', title: 'Erro ao Enviar' });
        } finally {
            setIsSending(false);
        }
    }, [isSending, currentUser, toast]);
    
    const sendLocation = useCallback(() => {
        if (!navigator.geolocation) {
            toast({ variant: 'destructive', title: 'Geolocalização não suportada.' });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const link = `https://maps.google.com/?q=${latitude},${longitude}`;
                handleSendMessage(link, true);
            },
            () => {
                toast({ variant: 'destructive', title: 'Não foi possível obter sua localização.' });
            }
        );
    }, [handleSendMessage, toast]);

    const renderMessageContent = (msg: Message) => {
        // User always sees their own original message
        if (msg.senderId === currentUser?.uid) {
            if (msg.isLocation && msg.originalText?.startsWith('http')) {
                 return (
                    <a href={msg.originalText} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1 text-primary-foreground">
                        <MapPin className="h-4 w-4" /> Minha Localização
                    </a>
                );
            }
            return msg.originalText;
        }
        // User sees admin's message (already in user's language)
        return msg.text;
    };
    
    if (!isOpen) return null;

    return (
        <div className={cn("fixed bottom-24 right-6 z-[1000] transition-all duration-300", isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none")}>
            <Card className="w-[360px] h-[500px] max-w-md flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 shadow-neon-red-strong border-primary/50 bg-black/90 backdrop-blur-xl md:rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-center relative border-b border-primary/20">
                    <CardTitle className="text-xl text-primary text-shadow-neon-red-light">
                        CHAT SECRETO
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-10 w-10 animate-spin text-primary"/>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === 'admin' ? 'justify-start' : 'justify-end')}>
                                {msg.senderId === 'admin' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>A</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xs md:max-w-md rounded-lg px-4 py-2 relative",
                                    msg.senderId === 'admin' ? 'bg-secondary text-secondary-foreground rounded-bl-sm' : 'bg-primary text-primary-foreground rounded-br-sm'
                                )}>
                                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {renderMessageContent(msg)}
                                    </p>
                                    <p className="text-xs text-right opacity-70 mt-1">
                                        {msg.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Enviando...'}
                                    </p>
                                </div>
                                {msg.senderId !== 'admin' && (
                                    <div className="relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <Image
                                            src="https://w7.pngwing.com/pngs/267/59/png-transparent-blue-and-white-check-logo-illustration-verified-badge-logo-youtube-youtube-thumbnail.png"
                                            alt="Selo de verificado"
                                            width={16}
                                            height={16}
                                            className="absolute -bottom-1 -right-1"
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t border-primary/20 p-2.5">
                    <div className="flex w-full items-center space-x-2">
                        <Textarea
                            placeholder="Mensagem..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(newMessage);
                                }
                            }}
                            className="flex-1 bg-neutral-800 border-none focus:shadow-neon-red-light min-h-[40px] h-10 max-h-24 resize-none rounded-2xl px-4 text-white placeholder:text-neutral-400"
                            disabled={isSending}
                            rows={1}
                        />
                         <Button 
                            variant="ghost"
                            size="icon" 
                            onClick={sendLocation} 
                            disabled={isSending}
                            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full w-10 h-10 flex-shrink-0"
                            aria-label="Enviar Localização"
                        >
                            <MapPin className="h-5 w-5" />
                        </Button>
                        <Button 
                            type="submit" 
                            size="icon" 
                            onClick={() => handleSendMessage(newMessage)} 
                            disabled={isSending || newMessage.trim() === ''}
                            className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-full w-10 h-10 flex-shrink-0"
                            aria-label="Enviar Mensagem"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
