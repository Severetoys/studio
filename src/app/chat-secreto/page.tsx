
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now only serves to redirect to the home page, as the chat is now a widget.
export default function SecretChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecionando...</p>
    </div>
  );
}
