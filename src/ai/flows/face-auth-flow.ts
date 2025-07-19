
'use server';
/**
 * @fileOverview Face authentication flow using Google Vision API.
 * This file implements the logic for user verification based on facial recognition,
 * inspired by the user's provided Google Apps Script.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize the Vision API client, ensuring it uses the project's service account.
const visionClient = new ImageAnnotatorClient({
  keyFilename: './serviceAccountKey.json',
});

/**
 * Helper function to detect a single face in a base64 encoded image.
 * This is the core verification logic, similar to the `verifyUserLogin` in the user's script.
 * @param imageBase64 The base64 encoded image string.
 * @returns An object indicating if a valid face was detected.
 */
async function detectSingleFace(imageBase64: string): Promise<{
  faceFound: boolean;
  error?: string;
}> {
  try {
    const [result] = await visionClient.faceDetection(Buffer.from(imageBase64.split(',')[1], 'base64'));
    const faces = result.faceAnnotations;

    if (!faces || faces.length === 0) {
      return { faceFound: false, error: 'No face detected in the image.' };
    }
    if (faces.length > 1) {
      return { faceFound: false, error: 'Multiple faces detected. Please ensure only one person is in the frame.' };
    }
    
    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    // Check for high confidence and basic quality metrics.
    if (confidence < 0.85) {
        return { faceFound: false, error: `Low face detection confidence: ${confidence.toFixed(2)}` };
    }
    if (face.blurredLikelihood === 'VERY_LIKELY' || face.underExposedLikelihood === 'VERY_LIKELY') {
        return { faceFound: false, error: 'Image quality is too low (blurry or underexposed).'};
    }

    return { faceFound: true };

  } catch (error: any) {
    console.error('Google Vision API Error:', error);
    return { faceFound: false, error: 'An error occurred during face analysis.' };
  }
}


const VerifyFaceInputSchema = z.object({
  liveImage: z.string().describe("A base64 encoded image captured from the user's camera."),
});

const VerifyFaceOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the face verification was successful.'),
  reason: z.string().optional().describe('The reason for verification failure.'),
});


/**
 * Genkit flow to verify a user's face.
 * If a valid face is detected in the live image, it returns success.
 */
const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: VerifyFaceInputSchema,
    outputSchema: VerifyFaceOutputSchema,
  },
  async ({ liveImage }) => {
    const faceCheckResult = await detectSingleFace(liveImage);

    if (!faceCheckResult.faceFound) {
      return {
        isMatch: false,
        reason: faceCheckResult.error,
      };
    }
    
    // If a face is found, verification is successful.
    return { isMatch: true };
  }
);


/**
 * Exported function to be called from the client-side.
 * It invokes the Genkit flow and returns its result.
 */
export async function verifyFace(input: z.infer<typeof VerifyFaceInputSchema>): Promise<z.infer<typeof VerifyFaceOutputSchema>> {
    return await verifyFaceFlow(input);
}
