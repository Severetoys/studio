'use server';
/**
 * @fileOverview Exemplo de como gerar um Custom Token do Firebase usando o Firebase Admin SDK.
 * Este código deve ser executado em um ambiente de backend seguro.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// --- INÍCIO DA CONFIGURAÇÃO DO FIREBASE ADMIN SDK ---

// Caminho para o arquivo de credenciais de serviço.
const serviceAccountPath = path.resolve('./serviceAccountKey.json');

// Inicializa o Firebase Admin SDK, mas apenas se ainda não foi inicializado.
function initializeFirebaseAdmin(): App {
  console.log(`[Admin SDK] Tentando inicializar...`);
  console.log(`[Admin SDK] Caminho esperado para serviceAccountKey.json: ${serviceAccountPath}`);
  
  if (getApps().length) {
    console.log(`[Admin SDK] Uma instância do Firebase Admin já existe. Reutilizando-a.`);
    return getApps()[0];
  }

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`[Admin SDK] ERRO: Arquivo de conta de serviço não encontrado em: ${serviceAccountPath}`);
    console.error("[Admin SDK] Verifique se o arquivo 'serviceAccountKey.json' foi incluído no deploy para o App Hosting.");
    throw new Error("Missing Firebase service account key.");
  }

  try {
    const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
    console.log("[Admin SDK] Arquivo serviceAccountKey.json lido com sucesso.");
    
    const serviceAccount = JSON.parse(serviceAccountFile);
    console.log("[Admin SDK] JSON do arquivo de serviço parseado com sucesso.");

    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log(`[Admin SDK] Firebase Admin SDK inicializado com sucesso para o projeto: ${app.options.projectId}`);
    return app;

  } catch (error: any) {
    console.error('[Admin SDK] ERRO CRÍTICO durante a inicialização do Firebase Admin:', error);
    if (error.code === 'ENOENT') {
      console.error('[Admin SDK] Detalhe: O sistema não encontrou o arquivo no caminho especificado.');
    } else if (error instanceof SyntaxError) {
      console.error('[Admin SDK] Detalhe: O arquivo serviceAccountKey.json parece estar corrompido ou não é um JSON válido.');
    }
    throw new Error(`Falha ao inicializar Firebase Admin SDK: ${error.message}`);
  }
}

// --- FIM DA CONFIGURAÇÃO DO FIREBASE ADMIN SDK ---


const GenerateTokenInputSchema = z.object({
  uid: z.string().describe('O ID de usuário único (UID) para o qual o token será gerado.'),
  premium: z.boolean().optional().describe('Um campo de exemplo para claims personalizadas.'),
});

const GenerateTokenOutputSchema = z.object({
  customToken: z.string().describe('O token personalizado gerado pelo Firebase.'),
});


export async function generateCustomFirebaseToken(input: z.infer<typeof GenerateTokenInputSchema>): Promise<z.infer<typeof GenerateTokenOutputSchema>> {
  return generateCustomTokenFlow(input);
}


const generateCustomTokenFlow = ai.defineFlow(
  {
    name: 'generateCustomTokenFlow',
    inputSchema: GenerateTokenInputSchema,
    outputSchema: GenerateTokenOutputSchema,
  },
  async (input) => {
    initializeFirebaseAdmin();

    const { uid } = input;
    const additionalClaims = {
      premium: input.premium || false,
    };
    
    try {
      const customToken = await getAuth().createCustomToken(uid, additionalClaims);
      
      console.log(`[generateCustomTokenFlow] Token personalizado gerado com sucesso para o UID: ${uid}`);
      
      return { customToken };

    } catch (error: any) {
      console.error('[generateCustomTokenFlow] Erro ao gerar o token personalizado:', error.message);
      throw new Error(`Falha ao gerar token: ${error.message}`);
    }
  }
);
