
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter usando a API v2 diretamente.
 * Este fluxo se autentica usando um Bearer Token para buscar os tweets de um usuário
 * e extrair as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define o schema de entrada, que espera o nome de usuário do Twitter.
const TwitterMediaInputSchema = z.object({
  username: z.string().describe("O nome de usuário do Twitter para buscar as mídias."),
  maxResults: z.number().optional().default(100).describe("Número máximo de tweets a serem retornados."),
});
export type TwitterMediaInput = z.infer<typeof TwitterMediaInputSchema>;

// Define o schema de saída.
const TwitterMediaOutputSchema = z.object({
    tweets: z.array(z.object({
        id: z.string(),
        text: z.string(),
        created_at: z.string().optional(),
        media: z.array(z.object({
            media_key: z.string(),
            type: z.enum(['photo', 'video', 'animated_gif']),
            url: z.string().optional(),
            preview_image_url: z.string().optional(),
            variants: z.any().optional(),
        })),
    })),
});
export type TwitterMediaOutput = z.infer<typeof TwitterMediaOutputSchema>;


/**
 * Fluxo Genkit que busca os tweets com mídia de um usuário do Twitter fazendo chamadas diretas à API.
 */
const fetchTwitterMediaFlow = ai.defineFlow(
  {
    name: 'fetchTwitterMediaFlow',
    inputSchema: TwitterMediaInputSchema,
    outputSchema: TwitterMediaOutputSchema,
  },
  async ({ username, maxResults }) => {
    
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      throw new Error("A credencial TWITTER_BEARER_TOKEN não está configurada no ambiente do servidor.");
    }

    const headers = {
      'Authorization': `Bearer ${bearerToken}`,
    };

    try {
      // 1. Obter o ID do usuário a partir do nome de usuário
      const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, { headers });
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(`Erro ao buscar usuário do Twitter: ${errorData.title} - ${errorData.detail}`);
      }
      const userData = await userResponse.json();
      const userId = userData.data?.id;

      if (!userId) {
        throw new Error(`Usuário do Twitter "${username}" não encontrado.`);
      }

      // 2. Buscar a timeline do usuário
      const params = new URLSearchParams({
          'tweet.fields': 'attachments,created_at,text',
          'expansions': 'attachments.media_keys',
          'media.fields': 'url,preview_image_url,type,variants,media_key',
          'exclude': 'retweets,replies',
          'max_results': maxResults.toString(),
      });
      
      const timelineResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?${params.toString()}`, { headers });
      if (!timelineResponse.ok) {
          const errorData = await timelineResponse.json();
          throw new Error(`Erro ao buscar timeline: ${errorData.title} - ${errorData.detail}`);
      }
      const timelineData = await timelineResponse.json();
      
      const mediaMap = new Map<string, any>();
      if (timelineData.includes?.media) {
          for (const media of timelineData.includes.media) {
              mediaMap.set(media.media_key, media);
          }
      }
      
      const tweetsWithMedia = (timelineData.data || [])
          .map((tweet: any) => {
               if (!tweet.attachments || !tweet.attachments.media_keys) {
                  return null;
              }
              const medias = tweet.attachments.media_keys
                  .map((key: string) => mediaMap.get(key))
                  .filter(Boolean);
              
              if (medias.length === 0) {
                  return null;
              }

              return {
                  id: tweet.id,
                  text: tweet.text,
                  created_at: tweet.created_at,
                  media: medias,
              };
          })
          .filter(Boolean);

      return { tweets: tweetsWithMedia as any };

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Twitter:', error);
        const errorMessage = error.message || "Erro desconhecido ao acessar a API do Twitter.";
        throw new Error(`Não foi possível carregar o feed do Twitter. Motivo: ${errorMessage}`);
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 * Invoca o fluxo Genkit e retorna seu resultado.
 */
export async function fetchTwitterFeed(input: TwitterMediaInput): Promise<TwitterMediaOutput> {
    return fetchTwitterMediaFlow(input);
}
