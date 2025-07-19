// src/lib/firebase-admin.ts
'use server';
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instance.
 * This ensures that the SDK is initialized only once across the server-side application.
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

// Path to the service account key file.
const serviceAccountPath = path.resolve('./serviceAccountKey.json');

let adminApp: App;

/**
 * Initializes the Firebase Admin SDK if not already initialized.
 * This function handles finding the service account key, parsing it,
 * and creating a single instance of the Firebase Admin App.
 *
 * @returns {App} The initialized Firebase Admin App instance.
 */
function initializeFirebaseAdmin(): App {
  // If an app is already initialized, return it to prevent errors.
  if (getApps().length) {
    console.log('[Admin SDK] Re-using existing Firebase Admin instance.');
    return getApps()[0];
  }

  // Check if the service account key file exists.
  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`[Admin SDK] ERROR: Service account file not found at: ${serviceAccountPath}`);
    console.error("[Admin SDK] Ensure 'serviceAccountKey.json' is included in your deployment.");
    throw new Error("Missing Firebase service account key.");
  }

  try {
    // Read and parse the service account file.
    const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountFile);
    console.log("[Admin SDK] Service account key file successfully read and parsed.");

    // Initialize the app with the service account credentials.
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log(`[Admin SDK] Firebase Admin SDK initialized successfully for project: ${app.options.projectId}`);
    return app;

  } catch (error: any) {
    console.error('[Admin SDK] CRITICAL ERROR during Firebase Admin initialization:', error);
    if (error.code === 'ENOENT') {
      console.error('[Admin SDK] Detail: The system could not find the file at the specified path.');
    } else if (error instanceof SyntaxError) {
      console.error('[Admin SDK] Detail: The serviceAccountKey.json file seems to be corrupted or not valid JSON.');
    }
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

// Initialize the app and store the instance.
adminApp = initializeFirebaseAdmin();

export { adminApp };
