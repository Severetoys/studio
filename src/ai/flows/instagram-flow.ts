
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Instagram.
 * Este fluxo usa um token de acesso para buscar os posts de um usuário
 * e extrair as URLs das mídias.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define o schema de entrada, que espera o ID de usuário do Instagram.
const InstagramMediaInputSchema = z.object({
  userId: z.string().default('me').describe("O ID de usuário do Instagram. 'me' é usado para o usuário autenticado."),
  maxResults: z.number().optional().default(25).describe("Número máximo de mídias a serem retornadas."),
});
export type InstagramMediaInput = z.infer<typeof InstagramMediaInputSchema>;

// Define o schema de saída.
const InstagramMediaOutputSchema = z.object({
  media: z.array(z.object({
    id: z.string(),
    caption: z.string().optional(),
    media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
    media_url: z.string().optional(),
    thumbnail_url: z.string().optional(),
    permalink: z.string(),
    timestamp: z.string(),
  })),
});
export type InstagramMediaOutput = z.infer<typeof InstagramMediaOutputSchema>;


// Cache em memória simples para armazenar os resultados
let cache = {
    data: null as InstagramMediaOutput | null,
    timestamp: 0,
};
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Fluxo Genkit que busca os posts com mídia de um usuário do Instagram.
 */
const fetchInstagramMediaFlow = ai.defineFlow(
  {
    name: 'fetchInstagramMediaFlow',
    inputSchema: InstagramMediaInputSchema,
    outputSchema: InstagramMediaOutputSchema,
  },
  async ({ userId, maxResults }) => {

    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION_MS)) {
        console.log("Retornando dados do cache do Instagram.");
        return cache.data;
    }
    console.log("Cache do Instagram expirado ou vazio. Buscando novos dados.");
    
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken || accessToken === 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE') {
      throw new Error("A credencial INSTAGRAM_ACCESS_TOKEN não está configurada no ambiente do servidor.");
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=${maxResults}&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao buscar mídia do Instagram: ${errorData.error.message}`);
      }
      
      const data = await response.json();

      const result = { media: data.data || [] };

      // Atualiza o cache
      cache = {
          data: result,
          timestamp: now,
      };

      return result;

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Instagram:', error);
        if (cache.data) {
            console.warn("Falha ao buscar novos dados do Instagram, retornando cache antigo.");
            return cache.data;
        }
        const errorMessage = error.message || "Erro desconhecido ao acessar a API do Instagram.";
        throw new Error(`Não foi possível carregar o feed do Instagram. Motivo: ${errorMessage}`);
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function fetchInstagramFeed(input: InstagramMediaInput): Promise<InstagramMediaOutput> {
    return fetchInstagramMediaFlow(input);
}
