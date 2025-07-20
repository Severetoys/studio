
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter.
 * Este fluxo se autentica na API do Twitter v2, busca os tweets mais recentes
 * de um usuário específico e extrai as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

async function initializeTwitterClient() {
    // Importa a biblioteca dinamicamente para evitar problemas de inicialização no Next.js
    const { TwitterApi } = await import('twitter-api-v2');

    // Valida se as credenciais do Twitter estão presentes no ambiente.
    if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET || !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
        console.error("As credenciais da API do Twitter não estão configuradas no arquivo .env");
        throw new Error("Credenciais da API do Twitter não configuradas.");
    }

    // Inicializa o cliente da API do Twitter com as credenciais (OAuth 1.0a)
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    // Retorna o cliente com permissões de leitura e escrita
    return twitterClient.readWrite;
}


// Define o schema de entrada, que espera o nome de usuário do Twitter.
const TwitterMediaInputSchema = z.object({
  username: z.string().describe("O nome de usuário do Twitter para buscar as mídias."),
});
export type TwitterMediaInput = z.infer<typeof TwitterMediaInputSchema>;

// Define o schema de saída.
const TwitterMediaOutputSchema = z.object({
    tweets: z.array(z.object({
        id: z.string(),
        text: z.string(),
        media: z.array(z.object({
            url: z.string().optional(),
            type: z.string(),
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
  async ({ username }) => {
    try {
      const rwClient = await initializeTwitterClient();
      
      // 1. Obter o ID do usuário a partir do nome de usuário.
      const user = await rwClient.v2.userByUsername(username);
      if (!user.data) {
          throw new Error(`Usuário do Twitter não encontrado: ${username}`);
      }
      const userId = user.data.id;

      // 2. Buscar a timeline do usuário, solicitando a expansão de mídias.
      const tweetsPaginator = await rwClient.v2.userTimeline(userId, {
        expansions: ['attachments.media_keys'],
        'media.fields': ['url', 'type', 'preview_image_url'],
        max_results: 20, // Busca os 20 tweets mais recentes
      });

      const includedMedia = tweetsPaginator.includes?.media || [];
      const tweetData = [];

      // 3. Processar os tweets para extrair a mídia.
      for (const tweet of tweetsPaginator.data.data || []) {
        const mediaAttachments = tweet.attachments?.media_keys?.map(key => {
            const mediaInfo = includedMedia.find(m => m.media_key === key);
            return {
                url: mediaInfo?.type === 'video' ? mediaInfo.preview_image_url : mediaInfo?.url,
                type: mediaInfo?.type || 'unknown'
            };
        }).filter(m => m.url); // Filtra mídias sem URL

        if (mediaAttachments && mediaAttachments.length > 0) {
            tweetData.push({
                id: tweet.id,
                text: tweet.text,
                media: mediaAttachments,
            });
        }
      }

      return { tweets: tweetData };

    } catch (error: any) {
      console.error('Erro ao buscar o feed do Twitter:', error);
      // Lança um erro mais descritivo para o cliente.
      throw new Error(`Não foi possível carregar o feed do Twitter. Motivo: ${error.message}`);
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 * Invoca o fluxo Genkit e retorna seu resultado.
 */
export async function fetchTwitterFeed(input: TwitterMediaInput): Promise<TwitterMediaOutput> {
    return await fetchTwitterMediaFlow(input);
}
