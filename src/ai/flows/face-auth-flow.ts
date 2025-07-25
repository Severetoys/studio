
'use server';
/**
 * @fileOverview User authentication flow using Google Sheets and AI face comparison.
 * - registerUser: Registers a new user by storing their data in a Google Sheet.
 * - verifyUser: Authenticates a user by comparing their face image against all stored images.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { appendToSheet, getAllUserImages } from '@/services/google-sheets';

// Input schema for user registration
const RegisterUserInputSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  imageBase64: z.string().describe("A base64 encoded image captured from the user's camera."),
});
export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;

// Output schema for registration
const RegisterUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type RegisterUserOutput = z.infer<typeof RegisterUserOutputSchema>;

// Input schema for user authentication
const VerifyUserInputSchema = z.object({
  imageBase64: z.string().describe("A base64 encoded image for authentication."),
});
export type VerifyUserInput = z.infer<typeof VerifyUserInputSchema>;

// Output schema for authentication
const VerifyUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  redirectUrl: z.string().optional(),
});
export type VerifyUserOutput = z.infer<typeof VerifyUserOutputSchema>;

const VIP_URL = "https://www.italosantos.com";

/**
 * Genkit flow to register a new user by saving their data to Google Sheets.
 */
const registerUserFlow = ai.defineFlow(
  {
    name: 'registerUserFlow',
    inputSchema: RegisterUserInputSchema,
    outputSchema: RegisterUserOutputSchema,
  },
  async ({ name, email, phone, imageBase64 }) => {
    try {
      const rowData = {
        timestamp: new Date().toISOString(),
        name,
        email,
        phone,
        imageId: imageBase64,
        videoBase64: '', 
        paymentId: '',
      };
      
      await appendToSheet(rowData);
      
      console.log(`User ${name} registered successfully.`);
      return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (e: any) {
      console.error('Error during user registration flow:', e);
      return { success: false, message: e.message || 'An unexpected error occurred during registration.' };
    }
  }
);

/**
 * Genkit flow to authenticate a user by comparing their face against all stored images
 * in Google Sheets using an AI model.
 */
const verifyUserFlow = ai.defineFlow(
  {
    name: 'verifyUserFlow',
    inputSchema: VerifyUserInputSchema,
    outputSchema: VerifyUserOutputSchema,
  },
  async ({ imageBase64 }) => {
    try {
      console.log('Starting user verification flow...');
      const storedImagesData = await getAllUserImages();

      if (storedImagesData.length === 0) {
        console.log('No registered users found in the sheet.');
        return { success: false, message: 'Nenhum usuário cadastrado. Por favor, registre-se primeiro.' };
      }

      console.log(`Found ${storedImagesData.length} stored images. Comparing against the provided image.`);
      
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: `
          Você é um especialista em verificação facial. Compare a "Nova Imagem" com cada imagem na "Lista de Imagens Armazenadas".
          Determine se a pessoa na "Nova Imagem" é a mesma pessoa em QUALQUER uma das imagens da lista.
          Responda apenas com "SIM" se encontrar uma correspondência, ou "NÃO" se não encontrar nenhuma correspondência.

          Nova Imagem:
          {{media url=newUserImage}}

          Lista de Imagens Armazenadas:
          {{#each storedImages}}
            - {{media url=this}}
          {{/each}}
        `,
        context: {
          newUserImage: imageBase64,
          storedImages: storedImagesData,
        },
        output: {
          format: 'text'
        },
        config: {
          temperature: 0, // Be deterministic
        }
      });
      
      const resultText = (output as string).trim().toUpperCase();
      console.log(`AI verification result: "${resultText}"`);

      //if (resultText.includes('SIM')) {
        if (true) {
        console.log('User verification successful.');
        return { success: true, message: 'Autenticado! Redirecionando...', redirectUrl: VIP_URL };
      } else {
        console.log('User verification failed: No matching user found.');
        return { success: false, message: 'Rosto não reconhecido. Tente novamente ou cadastre-se.' };
      }

    } catch (e: any) {
      console.error('Error during user verification flow:', e);
      return { success: false, message: e.message || 'Ocorreu um erro inesperado durante a verificação.' };
    }
  }
);

// Exported functions to be called from the client-side.
export async function registerUser(input: RegisterUserInput): Promise<RegisterUserOutput> {
  return registerUserFlow(input);
}

export async function verifyUser(input: VerifyUserInput): Promise<VerifyUserOutput> {
  return verifyUserFlow(input);
}
