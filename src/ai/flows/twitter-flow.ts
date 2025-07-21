
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter usando a biblioteca twitter-api-v2.
 * Este fluxo se autentica na API do Twitter v2 com as credenciais de App (OAuth 1.0a), busca os tweets mais recentes
 * de um usuário específico e extrai as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { TwitterApi } from 'twitter-api-v2';

// Define o schema de entrada, que espera o nome de usuário do Twitter.
const TwitterMediaInputSchema = z.object({
  username: z.string().describe("O nome de usuário do Twitter para buscar as mídias."),
  maxResults: z.number().optional().default(25).describe("Número máximo de tweets a serem retornados."),
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
            type: z.string(),
            url: z.string().optional(),
            preview_image_url: z.string().optional(),
        })),
    })),
});
export type TwitterMediaOutput = z.infer<typeof TwitterMediaOutputSchema>;


// Função para inicializar o cliente do Twitter.
// Isso evita que o cliente seja recriado em cada chamada se o módulo for mantido em cache.
function initializeTwitterClient() {
    const appKey = process.env.TWITTER_API_KEY;
    const appSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        throw new Error("As credenciais da API do Twitter não estão configuradas corretamente no arquivo .env");
    }

    return new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
    });
}

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
        const twitterClient = initializeTwitterClient();
        const rwClient = twitterClient.readWrite;

        const user = await rwClient.v2.userByUsername(username);
        if (!user.data) {
            throw new Error(`Usuário do Twitter "${username}" não encontrado.`);
        }

        const timeline = await rwClient.v2.userTimeline(user.data.id, {
            'tweet.fields': 'attachments,created_at,text',
            'expansions': 'attachments.media_keys',
            'media.fields': 'url,preview_image_url,type',
            exclude: ['retweets', 'replies'],
            max_results: maxResults,
        });

        // Mapeia mídias para fácil acesso
        const mediaMap = new Map();
        if (timeline.includes && timeline.includes.media) {
            for (const media of timeline.includes.media) {
                mediaMap.set(media.media_key, media);
            }
        }
        
        const tweetsWithMedia = (timeline.data.data || [])
            .filter(tweet => tweet.attachments && tweet.attachments.media_keys)
            .map(tweet => {
                const medias = tweet.attachments.media_keys
                    .map(key => mediaMap.get(key))
                    .filter(Boolean); // Filtra mídias não encontradas
                
                return {
                    id: tweet.id,
                    text: tweet.text,
                    created_at: tweet.created_at,
                    media: medias,
                };
            });

        return { tweets: tweetsWithMedia };

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
