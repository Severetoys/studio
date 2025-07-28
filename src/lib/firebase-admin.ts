// src/lib/firebase-admin.ts
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instance.
 * This ensures that the SDK is initialized only once across the server-side application.
 */

import { initializeApp, cert, getApps, App } from 'firebase-admin/app';

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminApp: App;

/**
 * Initializes the Firebase Admin SDK if not already initialized.
 * This function handles creating a single instance of the Firebase Admin App.
 *
 * @returns {App} The initialized Firebase Admin App instance.
 */
function initializeFirebaseAdmin(): App {
  // If an app is already initialized, return it to prevent errors.
  if (getApps().length) {
    console.log('[Admin SDK] Re-using existing Firebase Admin instance.');
    return getApps()[0];
  }

  try {
    // Initialize the app with the service account credentials.
    const app = initializeApp({
      credential: cert(serviceAccount as any),
    });
    console.log(`[Admin SDK] Firebase Admin SDK initialized successfully for project: ${app.options.projectId}`);
    return app;

  } catch (error: any) {
    console.error('[Admin SDK] CRITICAL ERROR during Firebase Admin initialization:', error);
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

// Initialize the app and store the instance.
adminApp = initializeFirebaseAdmin();

export { adminApp };
