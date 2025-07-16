"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, GoogleIcon } from "./icons";
import { Mail, MessageCircle, ScanFace } from "lucide-react";

interface AuthFormProps {
  onLoginClick: () => void;
  onFaceAuthClick: () => void;
}

export function AuthForm({ onLoginClick, onFaceAuthClick }: AuthFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginClick();
  };

  return (
    <Card className="w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Choose your preferred method to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 text-base" onClick={onLoginClick}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Google
          </Button>
          <Button variant="outline" className="h-12 text-base" onClick={onLoginClick}>
            <AppleIcon className="mr-2 h-5 w-5 fill-current" />
            Apple
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="email" className="text-base">
              <Mail className="mr-2 h-4 w-4" /> Email
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-base">
              <MessageCircle className="mr-2 h-4 w-4" /> SMS
            </TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full h-11 text-base bg-primary hover:bg-primary/90">
                Sign In with Email
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="sms">
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
              </div>
              <Button type="submit" className="w-full h-11 text-base bg-primary hover:bg-primary/90">
                Send Code
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <Button variant="secondary" className="w-full h-12 text-base" onClick={onFaceAuthClick}>
          <ScanFace className="mr-2 h-5 w-5" />
          Authenticate with FaceID
        </Button>
      </CardContent>
      <CardFooter className="flex justify-between text-sm">
        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
          Forgot password?
        </a>
        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
          Sign Up
        </a>
      </CardFooter>
    </Card>
  );
}
