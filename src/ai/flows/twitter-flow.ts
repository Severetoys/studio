
'use server';
/**
 * @fileOverview Fluxo Genkit para interagir com a API do Twitter (X).
 *
 * - fetchTwitterMedia - Busca os tweets mais recentes de um usuário que contêm mídia.
 * - TwitterMediaInput - O tipo de entrada para a função.
 * - TwitterMediaOutput - O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TwitterApi } from 'twitter-api-v2';

// Define o schema de entrada, que espera o nome de usuário do Twitter.
const TwitterMediaInputSchema = z.object({
  username: z.string().describe('O nome de usuário do Twitter para buscar a mídia.'),
});
export type TwitterMediaInput = z.infer<typeof TwitterMediaInputSchema>;

// Define o schema de saída.
const TweetSchema = z.object({
    id: z.string(),
    text: z.string(),
    media: z.array(z.object({
        type: z.string(),
        url: z.string().optional(),
        preview_image_url: z.string().optional(),
    })).optional(),
});
export type Tweet = z.infer<typeof TweetSchema>;

const TwitterMediaOutputSchema = z.object({
  tweets: z.array(TweetSchema),
});
export type TwitterMediaOutput = z.infer<typeof TwitterMediaOutputSchema>;

/**
 * Função exportada para ser chamada do lado do cliente.
 * Invoca o fluxo Genkit e retorna seu resultado.
 */
export async function fetchTwitterMedia(input: TwitterMediaInput): Promise<TwitterMediaOutput> {
    return await fetchTwitterMediaFlow(input);
}


/**
 * Fluxo Genkit para buscar a mídia de um usuário do Twitter.
 */
const fetchTwitterMediaFlow = ai.defineFlow(
  {
    name: 'fetchTwitterMediaFlow',
    inputSchema: TwitterMediaInputSchema,
    outputSchema: TwitterMediaOutputSchema,
  },
  async ({ username }) => {
    
    // Inicializa o cliente da API do Twitter com as credenciais do ambiente.
    // Usamos App-only (Bearer Token) para autenticação, que é suficiente para ler tweets públicos.
    if (!process.env.TWITTER_BEARER_TOKEN) {
        console.error('A variável de ambiente TWITTER_BEARER_TOKEN não está definida.');
        throw new Error('A integração com o Twitter não está configurada. O Bearer Token está ausente.');
    }
    const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    const readOnlyClient = twitterClient.readOnly;

    try {
        // 1. Encontrar o ID do usuário a partir do nome de usuário.
        const user = await readOnlyClient.v2.userByUsername(username);
        if (!user.data) {
            throw new Error(`Usuário do Twitter não encontrado: ${username}`);
        }
        const userId = user.data.id;

        // 2. Buscar os tweets do usuário que contêm mídia.
        const timeline = await readOnlyClient.v2.userTimeline(userId, {
            'tweet.fields': ['id', 'text', 'attachments', 'in_reply_to_user_id'],
            'media.fields': ['url', 'preview_image_url', 'type'],
            'expansions': 'attachments.media_keys',
            'max_results': 100, // Busca os 100 tweets mais recentes
            'exclude': ['replies', 'retweets'], // Exclui respostas e retweets
        });

        const tweetsWithMedia: Tweet[] = [];

        for await (const tweet of timeline) {
            const media = timeline.includes.media(tweet);
            if (media && media.length > 0) {
                tweetsWithMedia.push({
                    id: tweet.id,
                    text: tweet.text,
                    media: media.map(m => ({
                        type: m.type,
                        url: m.url,
                        preview_image_url: m.preview_image_url,
                    }))
                });
            }
        }

        return { tweets: tweetsWithMedia };

    } catch (error: any) {
        console.error('Erro ao buscar dados do Twitter:', error);
        // Garante que o erro seja propagado de forma útil
        if (error.data && error.data.title === 'Unauthorized') {
             throw new Error('Falha na autenticação com a API do Twitter. Verifique se o Bearer Token está correto.');
        }
        throw new Error(`Falha na comunicação com a API do Twitter: ${error.message}`);
    }
  }
);
