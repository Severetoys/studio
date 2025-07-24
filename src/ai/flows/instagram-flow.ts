
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Instagram.
 * Este fluxo usa um token de acesso para buscar os posts de um usuário
 * e extrair as URLs das mídias.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define o schema de entrada, que espera o ID de usuário do Instagram e o token de acesso.
const InstagramMediaInputSchema = z.object({
  userId: z.string().default('me').describe("O ID de usuário do Instagram. 'me' é usado para o usuário autenticado."),
  accessToken: z.string().describe("O token de acesso do usuário obtido via login do Facebook."),
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


/**
 * Fluxo Genkit que busca os posts com mídia de um usuário do Instagram.
 */
const fetchInstagramMediaFlow = ai.defineFlow(
  {
    name: 'fetchInstagramMediaFlow',
    inputSchema: InstagramMediaInputSchema,
    outputSchema: InstagramMediaOutputSchema,
  },
  async ({ userId, accessToken, maxResults }) => {
    
    if (!accessToken) {
      throw new Error("O token de acesso do Instagram é necessário.");
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
      return result;

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Instagram:', error);
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
