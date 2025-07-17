'use server';
/**
 * @fileOverview Exemplo de como gerar um Custom Token do Firebase usando o Firebase Admin SDK.
 * Este código deve ser executado em um ambiente de backend seguro.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// --- INÍCIO DA CONFIGURAÇÃO DO FIREBASE ADMIN SDK ---

// Caminho para o arquivo de credenciais de serviço.
// IMPORTANTE: Você deve baixar este arquivo do seu console do Firebase e colocá-lo em um local seguro.
// Console > Configurações do Projeto > Contas de serviço > Gerar nova chave privada.
// NÃO inclua este arquivo no controle de versão (adicione-o ao .gitignore).
const serviceAccountPath = path.resolve('./serviceAccountKey.json');

// Inicializa o Firebase Admin SDK, mas apenas se ainda não foi inicializado.
function initializeFirebaseAdmin(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`ERRO: Arquivo de conta de serviço não encontrado em: ${serviceAccountPath}`);
    console.error("Faça o download do seu arquivo 'serviceAccountKey.json' do console do Firebase e coloque-o na raiz do seu projeto.");
    throw new Error("Missing Firebase service account key.");
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // A função initializeApp() do 'firebase-admin/app' é chamada aqui.
  return initializeApp({
    credential: cert(serviceAccount),
  });
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
      // A função auth.createCustomToken() é chamada aqui.
      const customToken = await getAuth().createCustomToken(uid, additionalClaims);
      
      console.log(`Token personalizado gerado com sucesso para o UID: ${uid}`);
      
      return { customToken };

    } catch (error: any) {
      console.error('Erro ao gerar o token personalizado:', error.message);
      throw new Error(`Falha ao gerar token: ${error.message}`);
    }
  }
);
