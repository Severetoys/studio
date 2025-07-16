'use server';
/**
 * @fileOverview A user authentication flow using face verification.
 *
 * - registerFace - Registers a user's face for future authentication.
 * - verifyFace - Verifies a user's face against their registered photo.
 * - FaceAuthInput - The input type for both registration and verification.
 * - FaceAuthOutput - The return type for the verification process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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


// In a real application, you would store this in a secure database.
// For this demo, we'll store the registered faces in memory.
const registeredFaces: Map<string, string> = new Map();


/**
 * Registers a user's face.
 * For this demo, we are storing the face data URI in memory.
 * In a real-world scenario, you should store this in a secure user database.
 * @param input The user ID and their photo data URI.
 * @returns A promise that resolves when registration is complete.
 */
export async function registerFace(input: FaceAuthInput): Promise<void> {
  // A simple check to see if the image contains a face could be added here
  // by calling the model before storing. For simplicity, we'll skip that for now.
  console.log(`Registering face for user: ${input.userId}`);
  registeredFaces.set(input.userId, input.photoDataUri);
  return Promise.resolve();
}


/**
 * Verifies a user's face against their registered photo.
 * @param input The user ID and a new photo data URI to verify.
 * @returns A promise that resolves with the verification result.
 */
export async function verifyFace(input: FaceAuthInput): Promise<FaceAuthOutput> {
  return verifyFaceFlow(input);
}


const verifyFacePrompt = ai.definePrompt({
    name: 'verifyFacePrompt',
    input: { schema: z.object({
        livePhoto: z.string(),
        registeredPhoto: z.string(),
    }) },
    output: { schema: FaceAuthOutputSchema },
    prompt: `You are a highly advanced AI security system specializing in facial recognition. Your task is to determine if two images are of the same person.

    Analyze the "live" photo and compare it to the "registered" photo.

    - If you are highly confident they are the same person, set isMatch to true.
    - If you are not confident, set isMatch to false.

    Provide a brief reason for your decision, for example, "Facial features, including nose, eyes, and jawline, show a strong correlation." or "Significant differences in facial structure and features were detected."

    Live Photo to check: {{media url=livePhoto}}
    Registered user photo for comparison: {{media url=registeredPhoto}}
    `,
    config: {
        temperature: 0.1, // Lower temperature for more deterministic results
    }
});


const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: FaceAuthInputSchema,
    outputSchema: FaceAuthOutputSchema,
  },
  async (input) => {
    const registeredPhoto = registeredFaces.get(input.userId);

    if (!registeredPhoto) {
      throw new Error(`User with ID ${input.userId} is not registered.`);
    }

    const { output } = await verifyFacePrompt({
        livePhoto: input.photoDataUri,
        registeredPhoto: registeredPhoto
    });

    if (!output) {
      throw new Error("The model failed to produce an output.");
    }

    return output;
  }
);
