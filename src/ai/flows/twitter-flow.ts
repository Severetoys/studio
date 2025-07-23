
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter usando a API v2.
 * Este fluxo se autentica usando um Bearer Token para buscar os tweets de um usuário
 * e extrair as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TwitterApi } from 'twitter-api-v2';

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
 * Fluxo Genkit que busca os tweets com mídia de um usuário do Twitter.
 */
const fetchTwitterMediaFlow = ai.defineFlow(
  {
    name: 'fetchTwitterMediaFlow',
    inputSchema: TwitterMediaInputSchema,
    outputSchema: TwitterMediaOutputSchema,
  },
  async ({ username, maxResults }) => {
    try {
      if (!process.env.TWITTER_BEARER_TOKEN) {
        throw new Error("A credencial TWITTER_BEARER_TOKEN não está configurada no ambiente do servidor.");
      }

      // Inicializa o cliente com o Bearer Token (App-only authentication)
      const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
      const readOnlyClient = client.readOnly;
      
      const user = await readOnlyClient.v2.userByUsername(username);
      if (!user.data) {
        throw new Error(`Usuário do Twitter "${username}" não encontrado.`);
      }
      const userId = user.data.id;

      const timeline = await readOnlyClient.v2.userTimeline(userId, {
          'tweet.fields': ['attachments', 'created_at', 'text'],
          'expansions': ['attachments.media_keys'],
          'media.fields': ['url', 'preview_image_url', 'type', 'variants'],
          'exclude': ['retweets', 'replies'],
          'max_results': maxResults,
      });
      
      const mediaMap = new Map<string, any>();
      if (timeline.includes?.media) {
          for (const media of timeline.includes.media) {
              mediaMap.set(media.media_key, media);
          }
      }
      
      const tweetsWithMedia = (timeline.data.data || [])
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
