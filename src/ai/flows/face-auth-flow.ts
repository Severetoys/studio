
'use server';
/**
 * @fileOverview Fluxo de autenticação facial usando a API Google Vision.
 * Este arquivo implementa a lógica para verificação de usuário com base no reconhecimento facial.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Inicializa o cliente da API Vision, garantindo que ele use a conta de serviço do projeto.
const visionClient = new ImageAnnotatorClient({
  keyFilename: './serviceAccountKey.json',
});

/**
 * Função auxiliar para detectar um único rosto em uma imagem codificada em base64.
 * Esta é a lógica central de verificação.
 * @param imageBase64 A string da imagem codificada em base64.
 * @returns Um objeto indicando se um rosto válido foi detectado.
 */
async function detectSingleFace(imageBase64: string): Promise<{
  faceFound: boolean;
  error?: string;
}> {
  try {
    if (!imageBase64 || !imageBase64.includes(',')) {
        return { faceFound: false, error: 'Dados de imagem inválidos ou vazios recebidos.' };
    }

    const [result] = await visionClient.faceDetection(Buffer.from(imageBase64.split(',')[1], 'base64'));
    const faces = result.faceAnnotations;

    if (!faces || faces.length === 0) {
      return { faceFound: false, error: 'Nenhum rosto detectado na imagem.' };
    }
    if (faces.length > 1) {
      return { faceFound: false, error: 'Múltiplos rostos detectados. Por favor, garanta que apenas uma pessoa esteja no quadro.' };
    }
    
    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    if (confidence < 0.85) {
        return { faceFound: false, error: `Baixa confiança na detecção de rosto: ${confidence.toFixed(2)}` };
    }
    if (face.blurredLikelihood === 'VERY_LIKELY' || face.underExposedLikelihood === 'VERY_LIKELY') {
        return { faceFound: false, error: 'A qualidade da imagem é muito baixa (borrada ou subexposta)..'};
    }

    return { faceFound: true };

  } catch (error: any) {
    console.error('Erro na API Google Vision:', error);
    return { faceFound: false, error: 'Ocorreu um erro durante a análise facial.' };
  }
}


const VerifyFaceInputSchema = z.object({
  liveImage: z.string().describe("Uma imagem codificada em base64 capturada da câmera do usuário."),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
export type VerifyFaceInput = z.infer<typeof VerifyFaceInputSchema>;


const VerifyFaceOutputSchema = z.object({
  isMatch: z.boolean().describe('Se a verificação facial foi bem-sucedida.'),
  reason: z.string().optional().describe('O motivo da falha na verificação.'),
});
export type VerifyFaceOutput = z.infer<typeof VerifyFaceOutputSchema>;


/**
 * Fluxo Genkit para verificar o rosto de um usuário.
 * Se um rosto válido for detectado na imagem ao vivo, ele retorna sucesso.
 */
const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: VerifyFaceInputSchema,
    outputSchema: VerifyFaceOutputSchema,
  },
  async ({ liveImage, name, email, phone }) => {

    const isRegistering = !!(name && email && phone);
    if(isRegistering) {
        console.log(`Registrando novo usuário: ${name} (${email})`);
        // Em um aplicativo real, você salvaria os dados do usuário e os dados faciais em um banco de dados aqui.
    } else {
        console.log('Fazendo login de usuário existente.');
        // Em um aplicativo real, você compararia o rosto da liveImage com um rosto armazenado aqui.
    }
    
    const faceCheckResult = await detectSingleFace(liveImage);

    if (!faceCheckResult.faceFound) {
      return {
        isMatch: false,
        reason: faceCheckResult.error,
      };
    }
    
    // Para esta demonstração, se um rosto for encontrado, a verificação é bem-sucedida.
    return { isMatch: true };
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 * Invoca o fluxo Genkit e retorna seu resultado.
 */
export async function verifyFace(input: VerifyFaceInput): Promise<VerifyFaceOutput> {
    return await verifyFaceFlow(input);
}
