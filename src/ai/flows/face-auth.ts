/**
 * @fileOverview Defines the data structures for the face authentication flow.
 *
 * - FaceAuthInputSchema - The Zod schema for the input.
 * - FaceAuthInput - The TypeScript type for the input.
 * - FaceAuthOutputSchema - The Zod schema for the output.
 * - FaceAuthOutput - The TypeScript type for the output.
 */
import {z} from 'zod';

export const FaceAuthInputSchema = z.object({
  userId: z.string().describe('A unique identifier for the user.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FaceAuthInput = z.infer<typeof FaceAuthInputSchema>;

export const FaceAuthOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the face in the photo matches the registered face.'),
  reason: z.string().describe('The reasoning behind the match decision.')
});
export type FaceAuthOutput = z.infer<typeof FaceAuthOutputSchema>;
