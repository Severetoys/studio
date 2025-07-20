
'use server';
/**
 * @fileOverview Fluxo para buscar mídias (fotos e vídeos) de um perfil do Twitter usando fetch direto.
 * Este fluxo se autentica na API do Twitter v2 com um Bearer Token, busca os tweets mais recentes
 * de um usuário específico e extrai as URLs das mídias anexadas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
            media_key: z.string(),
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
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
          throw new Error("A credencial TWITTER_BEARER_TOKEN não está configurada no arquivo .env");
      }
      
      const url = `https://api.twitter.com/2/tweets/search/recent?query=from:${username} has:media&expansions=attachments.media_keys&media.fields=url,type&tweet.fields=text`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Erro da API do Twitter:', errorBody);
        throw new Error(`Erro ao buscar tweets: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      // Mapeia os dados da resposta para o formato de saída esperado
      const includedMedia = data.includes?.media || [];

      const tweets = (data.data || []).map((tweet: any) => {
        const mediaKeys = tweet.attachments?.media_keys || [];
        const mediaForTweet = mediaKeys.map((key: string) => {
          return includedMedia.find((m: any) => m.media_key === key);
        }).filter(Boolean); // Filtra mídias não encontradas

        return {
          id: tweet.id,
          text: tweet.text,
          media: mediaForTweet,
        };
      });

      return { tweets };

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
