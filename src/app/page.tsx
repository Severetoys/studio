
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, Star, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Check className="h-5 w-5 text-accent" />,
    text: "Modern Design",
  },
  {
    icon: <Zap className="h-5 w-5 text-accent" />,
    text: "Lightning Fast",
  },
  {
    icon: <Star className="h-5 w-5 text-accent" />,
    text: "Top-tier Quality",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-4xl animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl border-accent/20 bg-card/80 backdrop-blur-xl">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <CardHeader className="p-0">
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                Italo Santos
              </CardTitle>
              <CardDescription className="mt-4 text-lg text-muted-foreground">
                A beautifully designed, world-class static page. Built with Next.js and ShadCN UI.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-8">
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {feature.icon}
                    <span className="text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" passHref>
                  <Button size="lg" className="w-full sm:w-auto h-12 text-base">View Profile</Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base">Learn More</Button>
              </div>
            </CardContent>
          </div>
          <div className="hidden md:flex items-center justify-center p-8 bg-accent/10 rounded-r-lg">
             <img src="https://placehold.co/600x600.png" alt="Placeholder" className="rounded-lg shadow-xl" data-ai-hint="abstract illustration" />
          </div>
        </div>
      </Card>
      <footer className="mt-8 text-center text-muted-foreground">
        <p>Copyright © Italo Santos 2025 - All rights reserved.</p>
      </footer>
    </main>
  );
}
