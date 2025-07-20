
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now only serves to redirect to the new conversations list.
export default function OldAdminChatRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/conversations');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecionando para a lista de conversas...</p>
    </div>
  );
}
