
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter, com cache para evitar limites de taxa.
 * Este fluxo se autentica usando um Bearer Token para buscar os tweets de um usuário
 * e extrair as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { unstable_cache as cache } from 'next/cache';

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
 * Função interna que busca os dados do Twitter.
 * Ela é envolvida pelo `cache` para evitar chamadas repetidas à API.
 */
const getTwitterFeed = async ({ username, maxResults }: TwitterMediaInput): Promise<TwitterMediaOutput> => {
    console.log(`Buscando novos dados do Twitter para o usuário: ${username}`);
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
        console.error("Erro da API do Twitter ao buscar usuário:", errorData);
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
          console.error("Erro da API do Twitter ao buscar timeline:", errorData);
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

      const result = { tweets: tweetsWithMedia as any };
      return result;

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Twitter:', error);
        const errorMessage = error.message || "Erro desconhecido ao acessar a API do Twitter.";
        throw new Error(`Não foi possível carregar o feed do Twitter. Motivo: ${errorMessage}`);
    }
}

// Caching da função `getTwitterFeed`.
// A função será executada apenas uma vez dentro do período de revalidação (15 minutos).
const cachedGetTwitterFeed = cache(
    async (params: TwitterMediaInput) => getTwitterFeed(params),
    ['twitter-feed'], // Chave de cache base
    {
      revalidate: 900, // 15 minutos em segundos
      tags: ['twitter'], // Tag para revalidação sob demanda, se necessário
    }
);

/**
 * Fluxo Genkit que busca os tweets com mídia de um usuário do Twitter fazendo chamadas diretas à API.
 * Agora utiliza um sistema de cache robusto para evitar o excesso de requisições.
 */
const fetchTwitterMediaFlow = ai.defineFlow(
  {
    name: 'fetchTwitterMediaFlow',
    inputSchema: TwitterMediaInputSchema,
    outputSchema: TwitterMediaOutputSchema,
  },
  async (input: TwitterMediaInput) => {
    return cachedGetTwitterFeed(input);
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 * Invoca o fluxo Genkit e retorna seu resultado.
 */
export async function fetchTwitterFeed(input: TwitterMediaInput): Promise<TwitterMediaOutput> {
    return fetchTwitterMediaFlow(input);
}
