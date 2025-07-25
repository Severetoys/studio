
'use server';
/**
 * @fileOverview User authentication flow using Firebase Storage, Realtime Database, and AI face comparison.
 * - registerUser: Registers a new user by storing their data and face image.
 * - verifyUser: Authenticates a user by comparing their face image against all stored images.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { saveUser, getAllUsers } from '@/services/user-auth-service';
import { detectFace } from '@/services/vision';

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
 * Genkit flow to register a new user.
 * It validates the face using Google Vision API, then saves the user data.
 */
const registerUserFlow = ai.defineFlow(
  {
    name: 'registerUserFlow',
    inputSchema: RegisterUserInputSchema,
    outputSchema: RegisterUserOutputSchema,
  },
  async (userData) => {
    try {
      // 1. Validate face using Google Vision API
      const faceValidation = await detectFace(userData.imageBase64);
      if (!faceValidation.faceDetected) {
        return { success: false, message: faceValidation.error || 'Nenhuma face válida detectada.' };
      }

      // 2. Save user data to Realtime DB and image to Storage
      await saveUser(userData);
      
      console.log(`User ${userData.name} registered successfully.`);
      return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (e: any) {
      console.error('Error during user registration flow:', e);
      return { success: false, message: e.message || 'An unexpected error occurred during registration.' };
    }
  }
);

/**
 * Genkit flow to authenticate a user by comparing their face against all stored images
 * using an AI model.
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
      const allUsers = await getAllUsers();

      if (allUsers.length === 0) {
        console.log('No registered users found.');
        return { success: false, message: 'Nenhum usuário cadastrado. Por favor, registre-se primeiro.' };
      }

      const storedImageUrls = allUsers.map(u => u.imageUrl).filter(Boolean);
      console.log(`Found ${storedImageUrls.length} stored images. Comparing against the provided image.`);
      
      // Convert URLs to data URIs for the prompt if necessary, or pass URLs directly if model supports it.
      // For this example, we assume the model can take public URLs.
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
          newUserImage: imageBase64, // Pass the new image as a data URI
          storedImages: storedImageUrls, // Pass the stored images as URLs
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

      if (resultText.includes('SIM')) {
        console.log('User verification successful.');
        return { success: true, message: 'Autenticado! Redirecionando...', redirectUrl: VIP_URL };
      } else {
        console.log('User verification failed: No matching user found.');
        return { success: false, message: 'Rosto não reconhecido. Tente novamente ou cadastre-se.' };
      }

    } catch (e: any)      {
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
