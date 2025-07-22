
"use client";

import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Você ainda não tem produtos
          </h3>
          <p className="text-sm text-muted-foreground">
            Você pode começar a vender assim que adicionar seu primeiro produto.
          </p>
          <Button className="mt-4">Adicionar Produto</Button>
        </div>
      </div>
    </>
  );
}
