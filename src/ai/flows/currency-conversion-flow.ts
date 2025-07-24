
'use server';
/**
 * @fileOverview Fluxo de conversão de moeda usando Genkit para obter taxas de câmbio.
 * - convertCurrency: Converte um valor fixo de BRL para a moeda do local do usuário.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema de entrada
const ConvertCurrencyInputSchema = z.object({
  targetLocale: z.string().describe('O local do usuário (ex: "en-US", "pt-BR", "en-GB").'),
});
export type ConvertCurrencyInput = z.infer<typeof ConvertCurrencyInputSchema>;

// Schema de saída
const ConvertCurrencyOutputSchema = z.object({
  amount: z.number().describe('O valor convertido.'),
  currencyCode: z.string().describe('O código da moeda (ex: "USD", "EUR").'),
  currencySymbol: z.string().describe('O símbolo da moeda (ex: "$", "€").'),
});
export type ConvertCurrencyOutput = z.infer<typeof ConvertCurrencyOutputSchema>;

/**
 * Fluxo Genkit para converter 99.00 BRL para a moeda do local do usuário.
 * A IA é usada para obter a taxa de câmbio e os detalhes da moeda.
 */
const convertCurrencyFlow = ai.defineFlow(
  {
    name: 'convertCurrencyFlow',
    inputSchema: ConvertCurrencyInputSchema,
    outputSchema: ConvertCurrencyOutputSchema,
  },
  async ({ targetLocale }) => {
    const baseAmount = 99.00;
    const baseCurrency = 'BRL';

    // Se o local for brasileiro, retorna BRL diretamente
    if (targetLocale.toLowerCase().includes('pt')) {
      return {
        amount: baseAmount,
        currencyCode: 'BRL',
        currencySymbol: 'R$',
      };
    }

    const prompt = `
      Baseado no local (locale) "${targetLocale}", determine a moeda local (código ISO 4217) e seu símbolo.
      Depois, converta ${baseAmount} ${baseCurrency} para essa moeda local.
      Use as taxas de câmbio atuais para a conversão.

      Forneça sua resposta como um objeto JSON com as seguintes chaves: "amount" (número), "currencyCode" (string) e "currencySymbol" (string).
      O campo "amount" deve ser um número com duas casas decimais, não uma string.
      
      Exemplo para "en-US": {"amount": 18.50, "currencyCode": "USD", "currencySymbol": "$"}
      Exemplo para "en-GB": {"amount": 14.80, "currencyCode": "GBP", "currencySymbol": "£"}
      Exemplo para "de-DE": {"amount": 17.20, "currencyCode": "EUR", "currencySymbol": "€"}
    `;

    try {
        const { output } = await ai.generate({
            prompt,
            model: 'googleai/gemini-2.0-flash',
            output: {
                format: 'json',
                schema: ConvertCurrencyOutputSchema,
            },
            config: {
                temperature: 0.1, // Para maior consistência
            }
        });

        if (!output) {
            throw new Error('A IA não retornou uma resposta válida.');
        }

        return output;

    } catch (e: any) {
        console.error("Erro ao converter moeda com a IA:", e.message);
        // Fallback para BRL em caso de erro na API
         return {
            amount: baseAmount,
            currencyCode: 'BRL',
            currencySymbol: 'R$',
        };
    }
  }
);

/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function convertCurrency(input: ConvertCurrencyInput): Promise<ConvertCurrencyOutput> {
  return convertCurrencyFlow(input);
}
