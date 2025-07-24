
'use server';
/**
 * @fileOverview Facial detection and embedding service using Google Vision API.
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize the client once, reusing it for all requests.
// The credentials are automatically sourced from the environment.
const visionClient = new ImageAnnotatorClient();

/**
 * Detects a single face in a base64 encoded image and returns its embedding vector.
 * @param imageBase64 The base64 encoded image string.
 * @returns An object containing the embedding vector or an error message.
 */
export async function getFaceEmbedding(imageBase64: string): Promise<{
  embedding?: number[];
  error?: string;
}> {
  try {
    if (!imageBase64 || !imageBase64.includes(',')) {
      return { error: 'Invalid or empty image data received.' };
    }

    const request = {
      image: {
        content: imageBase64.split(',')[1],
      },
      features: [{ type: 'FACE_DETECTION', maxResults: 1 }],
    };
    
    console.log("Sending request to Vision API...");
    const [result] = await visionClient.faceDetection(request);
    const faces = result.faceAnnotations;

    if (!faces || faces.length === 0) {
      return { error: 'No face detected in the image.' };
    }
    if (faces.length > 1) {
      return { error: 'Multiple faces detected. Please ensure only one person is in the frame.' };
    }
    
    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    if (confidence < 0.80) { 
        return { error: `Low confidence in face detection: ${confidence.toFixed(2)}. Try better lighting.` };
    }
    if (face.blurredLikelihood === 'VERY_LIKELY' || face.underExposedLikelihood === 'VERY_LIKELY') {
        return { error: 'Image quality is too low (blurry or underexposed). Try a clearer, well-lit image.'};
    }

    // Extract the feature vector (embedding) for the face.
    const embedding = face.features?.[0]?.featureVector;

    if (!embedding) {
      return { error: 'Could not extract face features (embedding). Please try again.' };
    }
    
    console.log("Face embedding extracted successfully.");
    return { embedding };

  } catch (error: any) {
    console.error('Google Vision API Error:', error);
    return { error: 'An error occurred during facial analysis.' };
  }
}

/**
 * Detects a single face in a base64 encoded image for basic verification.
 * @param imageBase64 The string of the base64 encoded image.
 * @returns An object indicating if a valid face was detected.
 */
export async function detectSingleFace(imageBase64: string): Promise<{
  faceFound: boolean;
  error?: string;
}> {
  try {
    if (!imageBase64 || !imageBase64.includes(',')) {
        return { faceFound: false, error: 'Invalid or empty image data received.' };
    }

    const request = {
      image: {
        content: imageBase64.split(',')[1],
      },
      features: [{ type: 'FACE_DETECTION' }],
    };
    
    const [result] = await visionClient.faceDetection(request);
    const faces = result.faceAnnotations;

    if (!faces || faces.length === 0) {
      return { faceFound: false, error: 'No face detected in the image.' };
    }
    if (faces.length > 1) {
      return { faceFound: false, error: 'Multiple faces detected. Please ensure only one person is in the frame.' };
    }
    
    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    if (confidence < 0.75) { 
        return { faceFound: false, error: `Low confidence in face detection: ${confidence.toFixed(2)}. Try better lighting.` };
    }
    if (face.blurredLikelihood === 'VERY_LIKELY' || face.underExposedLikelihood === 'VERY_LIKELY') {
        return { faceFound: false, error: 'Image quality is too low (blurry or underexposed). Try a clearer, well-lit image.'};
    }

    return { faceFound: true };

  } catch (error: any) {
    console.error('Google Vision API Error:', error);
    return { faceFound: false, error: 'An error occurred during facial analysis.' };
  }
}
