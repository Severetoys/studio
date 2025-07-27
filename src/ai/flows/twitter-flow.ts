
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter, com cache para evitar limites de taxa.
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
const TwitterMediaSchema = z.object({
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
});

const TwitterMediaOutputSchema = z.object({
    tweets: z.array(TwitterMediaSchema),
});
export type TwitterMediaOutput = z.infer<typeof TwitterMediaOutputSchema>;
export type TweetWithMedia = z.infer<typeof TwitterMediaSchema>;


// Cache em memória simples para armazenar os resultados
let cache = {
    data: null as TwitterMediaOutput | null,
    timestamp: 0,
};
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Fluxo Genkit que busca os tweets com mídia de um usuário do Twitter.
 */
const fetchTwitterMediaFlow = ai.defineFlow(
  {
    name: 'fetchTwitterMediaFlow',
    inputSchema: TwitterMediaInputSchema,
    outputSchema: TwitterMediaOutputSchema,
  },
  async ({ username, maxResults }) => {

    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION_MS)) {
        console.log("Retornando dados do cache do Twitter.");
        return cache.data;
    }
    console.log("Cache do Twitter expirado ou vazio. Buscando novos dados.");

    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken || bearerToken === 'YOUR_TWITTER_BEARER_TOKEN') {
      const errorMsg = "A credencial TWITTER_BEARER_TOKEN não está configurada no ambiente do servidor.";
      console.warn(errorMsg);
      throw new Error(errorMsg);
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

      const tweetsWithMedia: TweetWithMedia[] = (timelineData.data || [])
          .map((tweet: any): TweetWithMedia | null => {
               if (!tweet.attachments || !tweet.attachments.media_keys) {
                  return null;
              }
              const medias = tweet.attachments.media_keys
                  .map((key: string) => {
                      const mediaData = mediaMap.get(key);
                      if (!mediaData) return null;
                      // Correção: Garante que a URL da foto seja a correta, e vídeos tenham preview
                      if (mediaData.type === 'photo' && !mediaData.url) {
                        return null; // Ignora fotos sem URL
                      }
                      return mediaData;
                  })
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
          .filter((tweet): tweet is TweetWithMedia => tweet !== null);


      const result = { tweets: tweetsWithMedia };

      // Atualiza o cache
      cache = {
          data: result,
          timestamp: now,
      };

      return result;

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Twitter:', error);
        if (cache.data) {
            console.warn("Falha ao buscar novos dados do Twitter, retornando cache antigo.");
            return cache.data;
        }
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
