
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllReviews, updateReviewStatus, type Review } from './actions';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedReviews = await getAllReviews();
      setReviews(fetchedReviews);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar avaliações',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(reviewId);
    try {
      const result = await updateReviewStatus(reviewId, status);
      if (result.success) {
        toast({
          title: 'Status Atualizado!',
          description: result.message,
        });
        // Optimistically update UI
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId ? { ...review, status } : review
          )
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: error.message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusVariant = (status: Review['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Review['status']): string => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'pending':
      default:
        return 'Pendente';
    }
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Moderação de Avaliações</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Comentários</CardTitle>
          <CardDescription>
            Aprove ou rejeite os comentários deixados pelos visitantes no seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Autor</TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right w-[200px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Nenhuma avaliação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.author}</TableCell>
                      <TableCell className="text-muted-foreground">{review.text}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(review.status)}>
                          {getStatusText(review.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {updatingId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                        ) : (
                          review.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                                onClick={() => handleUpdateStatus(review.id, 'approved')}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" /> Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                onClick={() => handleUpdateStatus(review.id, 'rejected')}
                              >
                                <ThumbsDown className="h-4 w-4 mr-1" /> Rejeitar
                              </Button>
                            </div>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
