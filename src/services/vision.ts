
'use server';
/**
 * @fileOverview Facial detection service using Google Vision API.
 * This service is not currently used by the Google Sheets auth flow,
 * but is kept for potential future use or alternative implementations.
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';
import serviceAccount from '../../serviceAccountKey.json';

// Initialize the client once, reusing it for all requests.
const visionClient = new ImageAnnotatorClient({
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
    },
});

/**
 * Detects faces in a base64 encoded image.
 * @param imageBase64 The base64 encoded image string.
 * @returns An object indicating if a face was detected and is of sufficient quality.
 */
export async function detectFace(imageBase64: string): Promise<{
  faceDetected: boolean;
  error?: string;
}> {
  try {
    if (!imageBase64 || !imageBase64.includes(',')) {
      return { faceDetected: false, error: 'Invalid or empty image data received.' };
    }

    const request = {
      image: {
        content: imageBase64.split(',')[1],
      },
      features: [{ type: 'FACE_DETECTION', maxResults: 1 }],
    };
    
    console.log("Sending request to Vision API for face detection...");
    const [result] = await visionClient.faceDetection(request);
    const faces = result.faceAnnotations;

    if (!faces || faces.length === 0) {
      return { faceDetected: false, error: 'No face detected in the image.' };
    }
    if (faces.length > 1) {
      return { faceDetected: false, error: 'Multiple faces detected. Please ensure only one person is in the frame.' };
    }
    
    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    if (confidence < 0.75) { 
        return { faceDetected: false, error: `Low confidence in face detection: ${confidence.toFixed(2)}. Try better lighting.` };
    }
    if (face.blurredLikelihood === 'VERY_LIKELY' || face.underExposedLikelihood === 'VERY_LIKELY') {
        return { faceDetected: false, error: 'Image quality is too low (blurry or underexposed). Try a clearer, well-lit image.'};
    }
    
    console.log("Face detected successfully.");
    return { faceDetected: true };

  } catch (error: any) {
    console.error('Google Vision API Error:', error);
    return { faceDetected: false, error: 'An error occurred during facial analysis.' };
  }
}
