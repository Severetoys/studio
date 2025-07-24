
'use server';
/**
 * @fileOverview User authentication flow using facial recognition and Data Connect.
 * - registerUserWithFace: Registers a new user by storing their face embedding.
 * - authenticateUserFace: Authenticates a user by comparing their live face with stored embeddings.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFaceEmbedding } from '@/services/vision';
import { dc } from '../../../dataconnect/connector/auth';
import { User, Users, CreateUser, UpdateUserFaceEmbedding } from '../../../dataconnect/types';

// Cosine similarity threshold for face matching.
const SIMILARITY_THRESHOLD = 0.85; 

// Input schema for user registration
const RegisterUserInputSchema = z.object({
  liveImage: z.string().describe("A base64 encoded image captured from the user's camera."),
  name: z.string(),
  email: z.string().email(),
});
export type RegisterUserInput = z.infer<typeof RegisterUserInputSchema>;

// Output schema for registration
const RegisterUserOutputSchema = z.object({
  success: z.boolean(),
  userId: z.string().optional(),
  reason: z.string().optional(),
});
export type RegisterUserOutput = z.infer<typeof RegisterUserOutputSchema>;

// Input schema for user authentication
const AuthenticateUserInputSchema = z.object({
  liveImage: z.string().describe("A base64 encoded image for authentication."),
});
export type AuthenticateUserInput = z.infer<typeof AuthenticateUserInputSchema>;

// Output schema for authentication
const AuthenticateUserOutputSchema = z.object({
  authenticated: z.boolean(),
  userId: z.string().optional(),
  reason: z.string().optional(),
});
export type AuthenticateUserOutput = z.infer<typeof AuthenticateUserOutputSchema>;


/**
 * Calculates the cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Genkit flow to register a new user with their face embedding.
 */
const registerUserFlow = ai.defineFlow(
  {
    name: 'registerUserFlow',
    inputSchema: RegisterUserInputSchema,
    outputSchema: RegisterUserOutputSchema,
  },
  async ({ liveImage, name, email }) => {
    const embeddingResult = await getFaceEmbedding(liveImage);
    if (!embeddingResult.embedding) {
      return { success: false, reason: embeddingResult.error };
    }

    try {
      const { data, error } = await dc.createUser(CreateUser.from({
          name,
          email,
          faceEmbedding: embeddingResult.embedding,
      }));

      if (error) {
        console.error("DataConnect Error:", error);
        return { success: false, reason: `Failed to save user: ${error.message}` };
      }
      
      console.log('User registered successfully with ID:', data?.userId);
      return { success: true, userId: data?.userId };

    } catch (e: any) {
      console.error('Error during registration:', e);
      return { success: false, reason: 'An unexpected error occurred during registration.' };
    }
  }
);

/**
 * Genkit flow to authenticate a user by comparing their face against stored embeddings.
 */
const authenticateUserFlow = ai.defineFlow(
  {
    name: 'authenticateUserFlow',
    inputSchema: AuthenticateUserInputSchema,
    outputSchema: AuthenticateUserOutputSchema,
  },
  async ({ liveImage }) => {
    const liveEmbeddingResult = await getFaceEmbedding(liveImage);
    if (!liveEmbeddingResult.embedding) {
      return { authenticated: false, reason: liveEmbeddingResult.error };
    }
    const liveEmbedding = liveEmbeddingResult.embedding;

    try {
      const { data, error } = await dc.users();
      if (error) {
        console.error("DataConnect Error fetching users:", error);
        return { authenticated: false, reason: 'Could not fetch user data.' };
      }
      
      if (!data?.users) {
        return { authenticated: false, reason: 'No users found in the database.' };
      }

      let bestMatch: { userId: string, similarity: number } | null = null;

      for (const user of data.users) {
        if (user.faceEmbedding && user.faceEmbedding.length > 0) {
          const similarity = cosineSimilarity(liveEmbedding, user.faceEmbedding);
          if (similarity > (bestMatch?.similarity || 0)) {
            bestMatch = { userId: user.id, similarity };
          }
        }
      }

      if (bestMatch && bestMatch.similarity > SIMILARITY_THRESHOLD) {
        console.log(`User authenticated: ${bestMatch.userId} with similarity ${bestMatch.similarity}`);
        return { authenticated: true, userId: bestMatch.userId };
      }

      return { authenticated: false, reason: 'No matching face found. Please try again.' };
    } catch (e: any) {
      console.error('Error during authentication:', e);
      return { authenticated: false, reason: 'An unexpected error occurred during authentication.' };
    }
  }
);

export async function registerUserWithFace(input: RegisterUserInput): Promise<RegisterUserOutput> {
  return registerUserFlow(input);
}

export async function authenticateUserFace(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
  return authenticateUserFlow(input);
}
