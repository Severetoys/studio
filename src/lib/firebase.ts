// src/lib/firebase.ts
// Este arquivo re-exporta as instâncias de serviço do Firebase inicializadas em firebase-client.ts

import app, { db, auth, storage, functions, rtdb } from './firebase-client';

export { db, auth, storage, functions, rtdb };
export default app;
