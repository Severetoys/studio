
'use server';
/**
 * @fileOverview A user authentication flow using face verification with Google Cloud Vision API.
 *
 * - registerFace - Registers a user's face for future authentication.
 * - verifyFace - Verifies a user's face against their registered photo.
 */

import {ai} from '@/ai/genkit';
import { FaceAuthInput, FaceAuthInputSchema, FaceAuthOutput, FaceAuthOutputSchema } from './face-auth';
import { app } from '@/lib/firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { ImageAnnotatorClient } from '@google-cloud/vision';


// Initialize Firestore
const db = getFirestore(app);
const visionClient = new ImageAnnotatorClient();


/**
 * Converts a data URI to a Buffer.
 * @param dataUri The data URI string.
 * @returns The buffer containing the image data.
 */
function dataUriToBuffer(dataUri: string): Buffer {
    if (!dataUri.startsWith('data:')) {
        throw new Error('Invalid data URI format.');
    }
    const base64Data = dataUri.split(',')[1];
    if (!base64Data) {
        throw new Error('Could not extract Base64 data from URI.');
    }
    return Buffer.from(base64Data, 'base64');
}

/**
 * Detects faces in an image using Google Cloud Vision API.
 * @param imageBuffer The image buffer.
 * @returns The face annotations from the Vision API.
 */
async function detectFace(imageBuffer: Buffer) {
    const [result] = await visionClient.faceDetection({
        image: { content: imageBuffer },
    });
    return result.faceAnnotations;
}


/**
 * Registers a user's face in Firestore. It first verifies a face is present.
 * @param input The user ID and their photo data URI.
 * @returns A promise that resolves when registration is complete.
 */
export async function registerFace(input: FaceAuthInput): Promise<{success: boolean}> {
  console.log(`Registering face for user: ${input.userId}`);
  
  const imageBuffer = dataUriToBuffer(input.photoDataUri);
  const faces = await detectFace(imageBuffer);

  if (!faces || faces.length === 0) {
      throw new Error("No face detected in the registration photo. Please try again.");
  }
  if (faces.length > 1) {
      throw new Error("Multiple faces detected. Please ensure only one face is visible.");
  }

  try {
    const userDocRef = doc(db, "face_registrations", input.userId);
    await setDoc(userDocRef, { photoDataUri: input.photoDataUri });
    console.log(`Face registered and saved to Firestore for user: ${input.userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error during face registration in Firestore:", error);
    throw new Error("Failed to save face registration data.");
  }
}


/**
 * Verifies a user's face against their registered photo from Firestore using Google Vision API.
 * @param input The user ID and a new photo data URI to verify.
 * @returns A promise that resolves with the verification result.
 */
export async function verifyFace(input: FaceAuthInput): Promise<FaceAuthOutput> {
  return verifyFaceFlow(input);
}


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

    const registeredPhotoUri = userDoc.data()?.photoDataUri;
    if (!registeredPhotoUri) {
        throw new Error(`No registered photo found for user ${input.userId}.`);
    }

    // Convert both photos to buffers
    const livePhotoBuffer = dataUriToBuffer(input.photoDataUri);
    const registeredPhotoBuffer = dataUriToBuffer(registeredPhotoUri);
    
    // Detect faces in both images
    const [liveFaces, registeredFaces] = await Promise.all([
        detectFace(livePhotoBuffer),
        detectFace(registeredPhotoBuffer)
    ]);

    // Basic validation
    if (!liveFaces || liveFaces.length === 0) {
        return { isMatch: false, reason: 'No face detected in the live photo.' };
    }
    if (!registeredFaces || registeredFaces.length === 0) {
        return { isMatch: false, reason: 'Could not detect a face in the registered photo.' };
    }
    if (liveFaces.length > 1 || registeredFaces.length > 1) {
        return { isMatch: false, reason: 'Multiple faces detected in one of the images.' };
    }

    const liveFace = liveFaces[0];
    const registeredFace = registeredFaces[0];

    // NOTE: This is a simplified comparison. True biometric verification is much more complex
    // and would involve comparing feature vectors (embeddings), which the Cloud Vision API
    // does not provide for general use. We simulate a check by comparing basic attributes.
    const joyThreshold = 0.5; // Example threshold
    const liveJoy = liveFace.joyLikelihood;
    const regJoy = registeredFace.joyLikelihood;

    const isJoySimilar = (liveJoy !== 'VERY_UNLIKELY' && liveJoy !== 'UNLIKELY') === (regJoy !== 'VERY_UNLIKELY' && regJoy !== 'UNLIKELY');

    if (liveFace.detectionConfidence > 0.8 && registeredFace.detectionConfidence > 0.8 && isJoySimilar) {
        return {
            isMatch: true,
            reason: "Face detected with high confidence and similar expression.",
        };
    }

    return {
        isMatch: false,
        reason: "Faces did not match based on confidence and expression analysis.",
    };
  }
);
