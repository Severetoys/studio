
"use client";

import Link from "next/link";
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
  MessageSquare,
  LogOut,
  Image as ImageIcon,
  Video,
  Link2,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
    onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
    const pathname = usePathname();

    const navLinks = [
        { href: "/admin", label: "Dashboard", icon: Home },
        { href: "/admin/subscribers", label: "Assinantes", icon: Users },
        { href: "/admin/products", label: "Produtos", icon: Package },
        { href: "/admin/photos", label: "Fotos", icon: ImageIcon },
        { href: "/admin/videos", label: "Vídeos", icon: Video },
        { href: "/admin/integrations", label: "Integrações", icon: Link2 },
        { href: "/admin/chat", label: "Chat", icon: MessageSquare, badge: "6" },
    ];

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Package2 className="h-6 w-6 text-primary" />
                    <span className="">Admin Panel</span>
                </Link>
                <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === link.href ? 'bg-muted text-primary' : ''}`}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                            {link.badge && (
                                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                    {link.badge}
                                </Badge>
                            )}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-4">
                <Button size="sm" variant="secondary" className="w-full" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    );
}
