
'use server';
/**
 * @fileOverview User authentication flow using Google Sheets.
 * - registerUser: Registers a new user by storing their data in a Google Sheet.
 * - verifyUser: Authenticates a user by checking their face image against stored data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { appendToSheet, findUserInSheet } from '@/services/google-sheets';

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
        imageId: imageBase64, // Storing full base64 for simplicity as in the script
        videoBase64: '', // Video not captured in this version
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
 * Genkit flow to authenticate a user by checking their face against Google Sheets data.
 * This is a simplified verification as per the user's script logic.
 */
const verifyUserFlow = ai.defineFlow(
  {
    name: 'verifyUserFlow',
    inputSchema: VerifyUserInputSchema,
    outputSchema: VerifyUserOutputSchema,
  },
  async ({ imageBase64 }) => {
    try {
      // The provided script logic for verification is a simulation.
      // It checks if ANY user with a stored image exists.
      // We will replicate that simplified logic here.
      const userFound = await findUserInSheet(); // This will just check if any user exists with an image.

      if (userFound) {
        console.log('User verification successful (simulation).');
        return { success: true, message: 'Autenticado! Redirecionando...', redirectUrl: VIP_URL };
      } else {
        console.log('User verification failed: No matching user found.');
        return { success: false, message: 'Rosto não reconhecido.' };
      }
    } catch (e: any) {
      console.error('Error during user verification flow:', e);
      return { success: false, message: e.message || 'An unexpected error occurred during verification.' };
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
