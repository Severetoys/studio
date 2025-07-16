'use server';
/**
 * @fileOverview A user authentication flow using face verification.
 *
 * - registerFace - Registers a user's face for future authentication.
 * - verifyFace - Verifies a user's face against their registered photo.
 */

import {ai} from '@/ai/genkit';
import { FaceAuthInput, FaceAuthInputSchema, FaceAuthOutput, FaceAuthOutputSchema } from './face-auth';
import { z } from 'zod';
import { app } from '@/lib/firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


// Initialize Firestore
const db = getFirestore(app);


/**
 * Registers a user's face in Firestore.
 * @param input The user ID and their photo data URI.
 * @returns A promise that resolves when registration is complete.
 */
export async function registerFace(input: FaceAuthInput): Promise<void> {
  console.log(`Registering face for user: ${input.userId}`);
  const userDocRef = doc(db, "face_registrations", input.userId);
  await setDoc(userDocRef, { photoDataUri: input.photoDataUri });
  console.log(`Face registered and saved to Firestore for user: ${input.userId}`);
}


/**
 * Verifies a user's face against their registered photo from Firestore.
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
    const userDocRef = doc(db, "face_registrations", input.userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error(`User with ID ${input.userId} is not registered.`);
    }

    const registeredPhoto = userDoc.data()?.photoDataUri;

    if (!registeredPhoto) {
        throw new Error(`No registered photo found for user ${input.userId}.`);
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
