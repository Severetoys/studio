
'use server';
/**
 * @fileOverview Fluxo para buscar mídias do perfil do Instagram da loja (@severetoys).
 * Este fluxo usa um token de acesso de uma variável de ambiente para buscar os posts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// O schema de entrada é vazio, pois o token e o ID são configurados no servidor.
const InstagramShopInputSchema = z.object({});
export type InstagramShopInput = z.infer<typeof InstagramShopInputSchema>;

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
export type InstagramMedia = InstagramMediaOutput['media'][0];


/**
 * Fluxo Genkit que busca os posts com mídia do perfil @severetoys no Instagram.
 */
const fetchInstagramShopMediaFlow = ai.defineFlow(
  {
    name: 'fetchInstagramShopMediaFlow',
    inputSchema: InstagramShopInputSchema,
    outputSchema: InstagramMediaOutputSchema,
  },
  async () => {
    
    const accessToken = process.env.INSTAGRAM_SHOP_ACCESS_TOKEN;
    const userId = '17841451284030585'; // ID do perfil @severetoys
    const maxResults = 50;

    if (!accessToken) {
      throw new Error("O token de acesso do Instagram (INSTAGRAM_SHOP_ACCESS_TOKEN) não está configurado no ambiente do servidor.");
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const url = `https://graph.instagram.com/${userId}/media?fields=${fields}&limit=${maxResults}&access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro da API do Instagram (Shop Flow):", errorData.error);
        throw new Error(`Erro ao buscar mídia da loja no Instagram: ${errorData.error.message}`);
      }
      
      const data = await response.json();
      const result = { media: data.data || [] };
      return result;

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed da loja do Instagram:', error);
        const errorMessage = error.message || "Erro desconhecido ao acessar a API do Instagram.";
        throw new Error(`Não foi possível carregar o feed da loja. Motivo: ${errorMessage}`);
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function fetchInstagramShopFeed(): Promise<InstagramMediaOutput> {
    return fetchInstagramShopMediaFlow({});
}
