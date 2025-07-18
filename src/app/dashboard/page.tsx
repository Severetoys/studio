
"use client";

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app, messaging as getMessagingInstance } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { getToken } from "firebase/messaging";


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(app);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleNotificationPermission = async () => {
    toast({
        variant: "default",
        title: "Funcionalidade em Desenvolvimento",
        description: "A chave VAPID precisa ser configurada para habilitar as notificações.",
    });
    // try {
    //   const messaging = await getMessagingInstance;
    //   if (!messaging) {
    //     toast({
    //         variant: "destructive",
    //         title: "Messaging not supported",
    //         description: "Firebase Messaging is not supported in this browser.",
    //     });
    //     return;
    //   }
      
    //   const permission = await Notification.requestPermission();
    //   if (permission === 'granted') {
    //     toast({
    //       title: "Permission Granted!",
    //       description: "You will now receive notifications.",
    //       className: "bg-accent text-accent-foreground border-accent",
    //     });

    //     // IMPORTANTE: Substitua pela sua chave VAPID do Console do Firebase
    //     const vapidKey = "SUA_VAPID_KEY_AQUI"; 
    //     const currentToken = await getToken(messaging, { vapidKey });
        
    //     if (currentToken) {
    //       console.log('FCM Token:', currentToken);
    //        toast({
    //         title: "FCM Token Obtained",
    //         description: "Check the console for your device token.",
    //       });
    //       // Envie este token para o seu servidor
    //     } else {
    //       console.log('No registration token available. Request permission to generate one.');
    //        toast({
    //         variant: "destructive",
    //         title: "Could not get token",
    //         description: "Permission was granted, but token could not be obtained.",
    //       });
    //     }
    //   } else {
    //     toast({
    //       variant: "destructive",
    //       title: "Permission Denied",
    //       description: "You will not receive notifications.",
    //     });
    //   }
    // } catch(err) {
    //   console.error('An error occurred while getting token. ', err);
    //   const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
    //   toast({
    //     variant: "destructive",
    //     title: "Error requesting permission",
    //     description: errorMessage,
    //   });
    // }
  };


  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'password':
        return 'Email/Password';
      case 'phone':
        return 'SMS';
      case 'google.com':
        return 'Google';
      case 'apple.com':
        return 'Apple';
      default:
        return providerId;
    }
  };

  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-accent/20 bg-black/30 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-11 w-full mt-4" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component
  }

  const providerId = user.providerData[0]?.providerId || 'N/A';
  const avatarText = user.displayName?.charAt(0) || user.email?.charAt(0) || '?';

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
       <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-accent/20 bg-black/30 backdrop-blur-xl shadow-[0_0_20px_hsl(var(--accent-shadow))]">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <CardTitle className="text-3xl">
                Italo Santos
            </CardTitle>
          </div>
          <CardDescription>You are successfully logged in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-border pb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
              <AvatarFallback className="text-2xl bg-muted">{avatarText.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.displayName || 'Anonymous User'}</h2>
              <p className="text-sm text-muted-foreground">{user.email || 'No email provided'}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-accent" />
                <p>
                    <span className="text-muted-foreground">User ID: </span>
                    <span className="font-mono text-xs">{user.uid}</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <CheckCircle className="h-5 w-5 text-accent" />
                <p>
                    <span className="text-muted-foreground">Login Method: </span>
                    <strong>{getProviderName(providerId)}</strong>
                </p>
            </div>
          </div>

          <Button onClick={handleNotificationPermission} className="w-full h-11 text-base" variant="outline">
            <BellRing className="mr-2" />
            Enable Notifications
          </Button>

          <Button onClick={handleLogout} className="w-full h-11 text-base" variant="secondary">
            <LogOut className="mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
