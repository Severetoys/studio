
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, CheckCircle, BellRing } from 'lucide-react';

export default function DashboardPage() {

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background">
       <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-accent/20 bg-card backdrop-blur-xl shadow-[0_0_20px_hsl(var(--accent-shadow))]">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <CardTitle className="text-3xl">
                Italo Santos
            </CardTitle>
          </div>
          <CardDescription>Welcome to your profile page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-border pb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Italo Santos" data-ai-hint="profile avatar" />
              <AvatarFallback className="text-2xl bg-muted">IS</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">Italo Santos</h2>
              <p className="text-sm text-muted-foreground">italo.santos@example.com</p>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
                <UserIcon className="h-5 w-5 text-accent" />
                <p>
                    <span className="text-muted-foreground">User ID: </span>
                    <span className="font-mono text-xs">usr_123456789</span>
                </p>
            </div>
            <div className="flex items-center gap-4">
                <CheckCircle className="h-5 w-5 text-accent" />
                <p>
                    <span className="text-muted-foreground">Status: </span>
                    <strong>Verified</strong>
                </p>
            </div>
          </div>

          <Button className="w-full h-11 text-base" variant="outline">
            <BellRing className="mr-2" />
            Notifications
          </Button>

          <Button className="w-full h-11 text-base" variant="secondary">
            <LogOut className="mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
