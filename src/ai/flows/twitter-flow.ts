
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter usando a API v2.
 * Este fluxo se autentica usando um Bearer Token e busca os tweets mais recentes
 * de um usuário específico, extraindo as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fetch from 'node-fetch';

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
        const bearerToken = process.env.TWITTER_BEARER_TOKEN;

        if (!bearerToken) {
            throw new Error("A credencial TWITTER_BEARER_TOKEN não está configurada no arquivo .env");
        }

        // Primeiro, obtemos o ID do usuário a partir do nome de usuário.
        const userLookupUrl = `https://api.twitter.com/2/users/by/username/${username}`;
        const userResponse = await fetch(userLookupUrl, {
            headers: { 'Authorization': `Bearer ${bearerToken}` }
        });

        if (!userResponse.ok) {
            const errorData = await userResponse.json();
            console.error('Erro ao buscar usuário do Twitter:', errorData);
            throw new Error(`Usuário do Twitter "${username}" não encontrado ou erro na API: ${userResponse.statusText}`);
        }
        
        const userData = await userResponse.json();
        const userId = userData.data.id;

        if (!userId) {
             throw new Error(`Não foi possível encontrar o ID para o usuário "${username}".`);
        }

        // Agora, buscamos a timeline do usuário usando seu ID.
        const timelineUrl = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=attachments,created_at,text&expansions=attachments.media_keys&media.fields=url,preview_image_url,type&exclude=retweets,replies&max_results=${maxResults}`;

        const timelineResponse = await fetch(timelineUrl, {
            headers: { 'Authorization': `Bearer ${bearerToken}` }
        });

        if (!timelineResponse.ok) {
            const errorData = await timelineResponse.json();
            console.error('Erro ao buscar timeline do Twitter:', errorData);
            throw new Error(`Erro ao buscar timeline: ${timelineResponse.statusText}`);
        }

        const timelineData = await timelineResponse.json();

        const mediaMap = new Map<string, any>();
        if (timelineData.includes && timelineData.includes.media) {
            for (const media of timelineData.includes.media) {
                mediaMap.set(media.media_key, media);
            }
        }
        
        const tweetsWithMedia = (timelineData.data || [])
            .filter((tweet: any) => tweet.attachments && tweet.attachments.media_keys)
            .map((tweet: any) => {
                const medias = (tweet.attachments.media_keys || [])
                    .map((key: string) => mediaMap.get(key))
                    .filter(Boolean);
                
                return {
                    id: tweet.id,
                    text: tweet.text,
                    created_at: tweet.created_at,
                    media: medias,
                };
            });

        return { tweets: tweetsWithMedia };

    } catch (error: any) {
        console.error('Erro no fluxo ao buscar feed do Twitter:', error);
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
