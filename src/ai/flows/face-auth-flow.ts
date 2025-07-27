
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
  errorCode: z.enum(['NO_FACE_DETECTED', 'POOR_IMAGE_QUALITY', 'SAVE_FAILED', 'UNKNOWN']).optional(),
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
  errorCode: z.enum(['NO_USERS_FOUND', 'MATCH_NOT_FOUND', 'VERIFICATION_FAILED', 'UNKNOWN', 'NO_FACE_DETECTED']).optional(),
});
export type VerifyUserOutput = z.infer<typeof VerifyUserOutputSchema>;

const VIP_URL = "/dashboard";

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
        return { 
          success: false, 
          message: faceValidation.error || 'Nenhuma face válida detectada.',
          errorCode: faceValidation.errorCode,
        };
      }

      // 2. Save user data to Realtime DB and image to Storage
      await saveUser(userData);
      
      console.log(`User ${userData.name} registered successfully.`);
      return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (e: any) {
      console.error('Error during user registration flow:', e);
      return { success: false, message: e.message || 'An unexpected error occurred during registration.', errorCode: 'SAVE_FAILED' };
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
      
      // 1. Validate the new face image first
      const faceValidation = await detectFace(imageBase64);
      if (!faceValidation.faceDetected) {
        return { 
          success: false, 
          message: faceValidation.error || 'Nenhuma face válida detectada na sua imagem.',
          errorCode: 'NO_FACE_DETECTED',
        };
      }

      // 2. Get all registered users
      const allUsers = await getAllUsers();

      if (allUsers.length === 0) {
        console.log('No registered users found.');
        return { success: false, message: 'Nenhum usuário cadastrado. Por favor, registre-se primeiro.', errorCode: 'NO_USERS_FOUND' };
      }
      
      console.log(`Found ${allUsers.length} users to check. Comparing against the provided image.`);
      
      // 3. Iterate through each registered user and compare their face.
      for (const user of allUsers) {
        if (!user.imageUrl) {
            console.log(`Skipping user ${user.email} as they have no imageUrl.`);
            continue;
        }

        console.log(`Comparing face with user: ${user.email}`);
        const { output } = await ai.generate({
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
              loginImage: { url: imageBase64 }, // Pass the new image as a data URI
              storedImage: { url: user.imageUrl }, // Pass the stored image as a URL
            },
            output: {
              format: 'text'
            },
            config: {
              temperature: 0, // Be deterministic
            }
        });
        
        const resultText = (output as string || "").trim().toUpperCase();
        console.log(`AI verification result for ${user.email}: "${resultText}"`);

        // If a match is found, immediately return success.
        if (resultText.includes('SIM')) {
            console.log(`User verification successful for ${user.email}.`);
            return { success: true, message: 'Autenticado! Redirecionando...', redirectUrl: VIP_URL };
        }
      }

      // If the loop completes and no match was found.
      console.log('User verification failed: No matching user found after checking all images.');
      return { success: false, message: 'Rosto não reconhecido. Tente novamente ou cadastre-se.', errorCode: 'MATCH_NOT_FOUND' };

    } catch (e: any)      {
      console.error('Error during user verification flow:', e);
      return { success: false, message: e.message || 'Ocorreu um erro inesperado durante a verificação.', errorCode: 'VERIFICATION_FAILED' };
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
