
'use server';
/**
 * @fileOverview Fluxo para buscar mídias do perfil do Instagram (@severepics).
 * Este fluxo usa um token de acesso de uma variável de ambiente para buscar os posts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// O schema de entrada é vazio, pois o token e o ID são configurados no servidor.
const InstagramFeedInputSchema = z.object({});
export type InstagramFeedInput = z.infer<typeof InstagramFeedInputSchema>;

// Define o schema de saída.
const MediaSchema = z.object({
    id: z.string(),
    caption: z.string().optional().nullable(),
    media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
    media_url: z.string().optional(),
    thumbnail_url: z.string().optional(),
    permalink: z.string(),
    timestamp: z.string(),
});
export type InstagramMedia = z.infer<typeof MediaSchema>;


const InstagramFeedOutputSchema = z.object({
  media: z.array(MediaSchema),
  error: z.string().optional(),
});
export type InstagramFeedOutput = z.infer<typeof InstagramFeedOutputSchema>;


/**
 * Fluxo Genkit que busca os posts com mídia do perfil @severepics no Instagram.
 */
const fetchInstagramProfileMediaFlow = ai.defineFlow(
  {
    name: 'fetchInstagramProfileMediaFlow',
    inputSchema: InstagramFeedInputSchema,
    outputSchema: InstagramFeedOutputSchema,
  },
  async () => {
    
    const accessToken = process.env.INSTAGRAM_FEED_ACCESS_TOKEN;
    const userId = 'me'; // Usar "me" para se referir ao usuário autenticado pelo token.
    const maxResults = 50;

    if (!accessToken || accessToken === "YOUR_INSTAGRAM_FEED_ACCESS_TOKEN") {
      const errorMessage = "O token de acesso do Instagram para o feed (@severepics) não está configurado no ambiente do servidor (INSTAGRAM_FEED_ACCESS_TOKEN).";
      console.warn(errorMessage);
      return { media: [], error: errorMessage };
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=${maxResults}&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = `Erro ao buscar mídia do perfil no Instagram: ${errorData.error.message}`;
        console.error("Erro da API do Instagram (Feed Flow):", errorData.error);
        return { media: [], error: errorMessage };
      }
      
      const data = await response.json();
      const result = { media: (data.data || []).map((item: any) => ({...item, caption: item.caption || null})) };
      return result;

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Instagram:', error);
        const errorMessage = error.message || "Erro desconhecido ao acessar a API do Instagram.";
        return { media: [], error: `Não foi possível carregar o feed. Motivo: ${errorMessage}` };
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function fetchInstagramProfileFeed(): Promise<InstagramFeedOutput> {
    return fetchInstagramProfileMediaFlow({});
}
