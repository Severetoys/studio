"use client";

import { useState, useEffect } from 'react';
import { DollarSign, Users, CreditCard, Activity, MessageSquare, Star, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from './actions';

interface DashboardStats {
  totalSubscribers: number;
  totalConversations: number;
  totalProducts: number;
  pendingReviews: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        // Handle error display if necessary
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-10 w-1/2 bg-muted rounded animate-pulse" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Assinantes" 
          value={stats?.totalSubscribers ?? 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Usuários cadastrados com Face ID"
        />
        <StatCard 
          title="Conversas Ativas" 
          value={stats?.totalConversations ?? 0}
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          description="Total de chats iniciados"
        />
        <StatCard 
          title="Produtos Cadastrados" 
          value={stats?.totalProducts ?? 0}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="Itens disponíveis na loja"
        />
        <StatCard 
          title="Avaliações Pendentes" 
          value={stats?.pendingReviews ?? 0}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          description="Comentários aguardando moderação"
        />
      </div>
       <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-6"
      >
        <div className="flex flex-col items-center gap-1 text-center p-8">
           <Activity className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight mt-4">
            Análise Avançada em Breve
          </h3>
          <p className="text-sm text-muted-foreground">
            Em breve, você poderá ver análises detalhadas sobre os visitantes do seu site, incluindo país, região e as páginas mais acessadas.
          </p>
        </div>
      </div>
    </>
  );
}
