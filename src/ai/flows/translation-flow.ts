'use server';
/**
 * @fileOverview Fluxo de tradução usando Genkit.
 * - translateText: Traduz um texto para um idioma alvo.
 * - detectLanguage: Detecta o idioma de um texto.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema de entrada para tradução
const TranslateInputSchema = z.object({
  text: z.string().describe('O texto a ser traduzido.'),
  targetLanguage: z.string().describe('O idioma para o qual o texto deve ser traduzido (ex: "en", "pt-br").'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

// Schema de saída para tradução
const TranslateOutputSchema = z.object({
  translatedText: z.string().describe('O texto traduzido.'),
});
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

// Schema de entrada para detecção de idioma
const DetectLanguageInputSchema = z.object({
    text: z.string().describe('O texto para o qual o idioma será detectado.'),
});
export type DetectLanguageInput = z.infer<typeof DetectLanguageInputSchema>;

// Schema de saída para detecção de idioma
const DetectLanguageOutputSchema = z.object({
    language: z.string().describe('O código do idioma detectado (ex: "en", "pt-br").'),
});
export type DetectLanguageOutput = z.infer<typeof DetectLanguageOutputSchema>;


/**
 * Fluxo Genkit para traduzir texto.
 */
const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async ({ text, targetLanguage }) => {
    const prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
    const { output } = await ai.generate({
        prompt,
        model: 'googleai/gemini-2.0-flash',
        output: {
            format: 'text'
        }
    });

    return { translatedText: output as string };
  }
);

/**
 * Fluxo Genkit para detectar o idioma de um texto.
 */
const detectLanguageFlow = ai.defineFlow(
    {
        name: 'detectLanguageFlow',
        inputSchema: DetectLanguageInputSchema,
        outputSchema: DetectLanguageOutputSchema,
    },
    async ({ text }) => {
        const prompt = `Detect the language of the following text and return only its ISO 639-1 code (e.g., "en", "pt", "es"): "${text}"`;
        const { output } = await ai.generate({
            prompt,
            model: 'googleai/gemini-2.0-flash',
            output: {
                format: 'text'
            }
        });
        
        // Simple cleanup to remove potential extra text from the model's response.
        const languageCode = (output as string).trim().toLowerCase().substring(0, 2);
        return { language: languageCode };
    }
);


// Funções exportadas para serem chamadas do lado do cliente.
export async function translateText(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

export async function detectLanguage(input: DetectLanguageInput): Promise<DetectLanguageOutput> {
  return detectLanguageFlow(input);
}
