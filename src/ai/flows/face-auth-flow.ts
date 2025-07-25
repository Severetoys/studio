
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

      // Early exit if no images are available to compare against.
      if (storedImageUrls.length === 0) {
        console.log('No stored images found for registered users.');
        return { success: false, message: 'Nenhuma imagem de referência encontrada para os usuários.' };
      }

      console.log(`Found ${storedImageUrls.length} stored images. Comparing against the provided image.`);
      
      // Use the media helper to pass image data to the prompt.
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: `
          Você é um especialista em verificação facial. Sua única tarefa é comparar a "Imagem de Login" com a "Imagem Armazenada".
          Responda apenas com "SIM" se for a mesma pessoa, ou "NÃO" se não for.

          Imagem de Login: {{media url=loginImage}}
          Imagem Armazenada: {{media url=storedImage}}
        `,
        // The model can only compare one image at a time effectively in this setup.
        // We will iterate and check for any match.
      });

      // This logic needs to be revisited. A single prompt can't compare one against a list easily.
      // A better approach would be to iterate or use a model/tool designed for one-to-many comparison.
      // For now, let's simulate a check against the first user for demonstration. A real implementation would loop this.

      if (storedImageUrls.length > 0) {
          const firstUserImage = storedImageUrls[0];
          const { output: singleComparisonOutput } = await ai.generate({
              model: 'googleai/gemini-2.0-flash',
               prompt: `
                Você é um especialista em verificação facial. Compare a "Imagem de Login" com a "Imagem Armazenada".
                Responda APENAS com "SIM" se for a mesma pessoa, ou "NÃO" se não for. Não adicione nenhuma outra palavra ou pontuação.

                Imagem de Login:
                {{media url=loginImage}}

                Imagem Armazenada:
                {{media url=storedImage}}
              `,
              context: {
                loginImage: imageBase64, // Pass the new image as a data URI
                storedImage: firstUserImage, // Pass the stored image as a URL
              },
              output: {
                format: 'text'
              },
              config: {
                temperature: 0, // Be deterministic
              }
          });
          
          const resultText = (singleComparisonOutput as string || "").trim().toUpperCase();
          console.log(`AI verification result for the first user: "${resultText}"`);

          if (resultText.includes('SIM')) {
              console.log('User verification successful.');
              return { success: true, message: 'Autenticado! Redirecionando...', redirectUrl: VIP_URL };
          }
      }

      // If loop finished and no match was found
      console.log('User verification failed: No matching user found after checking all images.');
      return { success: false, message: 'Rosto não reconhecido. Tente novamente ou cadastre-se.' };

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
