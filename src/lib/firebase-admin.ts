
// src/lib/firebase-admin.ts
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instance.
 * This ensures that the SDK is initialized only once across the server-side application.
 */

import { initializeApp, cert, getApps, App, ServiceAccount } from 'firebase-admin/app';

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
    // A inicialização padrão sem argumentos usará as credenciais do ambiente
    // (GOOGLE_APPLICATION_CREDENTIALS) que são gerenciadas pela hospedagem.
    // Isso é mais seguro e robusto do que incluir um arquivo de chave de serviço.
    const app = initializeApp({
      databaseURL: "https://authkit-y9vjx-default-rtdb.firebaseio.com/"
    });
    console.log(`[Admin SDK] Firebase Admin SDK initialized successfully using default credentials.`);
    return app;

  } catch (error: any) {
    console.error('[Admin SDK] CRITICAL ERROR during Firebase Admin initialization:', error);
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

// Initialize the app and store the instance.
adminApp = initializeFirebaseAdmin();

export { adminApp };
