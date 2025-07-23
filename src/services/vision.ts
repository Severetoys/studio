
'use server';
/**
 * @fileOverview Serviço de detecção facial usando a API Google Vision.
 * Este arquivo contém a lógica isolada para a verificação de imagens.
 */

import { ImageAnnotatorClient } from '@google-cloud/vision';
import serviceAccount from '../../serviceAccountKey.json';

// Valida se as credenciais da conta de serviço estão presentes.
if (!serviceAccount || !serviceAccount.client_email || !serviceAccount.private_key) {
  throw new Error("As credenciais da conta de serviço (serviceAccountKey.json) estão ausentes ou incompletas.");
}

const visionClient = new ImageAnnotatorClient({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
  }
});

/**
 * Detecta um único rosto em uma imagem codificada em base64.
 * @param imageBase64 A string da imagem codificada em base64.
 * @returns Um objeto indicando se um rosto válido foi detectado.
 */
export async function detectSingleFace(imageBase64: string): Promise<{
  faceFound: boolean;
  error?: string;
}> {
  try {
    if (!imageBase64 || !imageBase64.includes(',')) {
        return { faceFound: false, error: 'Dados de imagem inválidos ou vazios recebidos.' };
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
      return { faceFound: false, error: 'Nenhum rosto detectado na imagem.' };
    }
    if (faces.length > 1) {
      return { faceFound: false, error: 'Múltiplos rostos detectados. Por favor, garanta que apenas uma pessoa esteja no quadro.' };
    }
    
    const face = faces[0];
    const confidence = face.detectionConfidence || 0;

    // Reduz o limite de confiança para ser um pouco mais permissivo
    if (confidence < 0.75) { 
        return { faceFound: false, error: `Baixa confiança na detecção de rosto: ${confidence.toFixed(2)}. Tente uma iluminação melhor.` };
    }
    if (face.blurredLikelihood === 'VERY_LIKELY' || face.underExposedLikelihood === 'VERY_LIKELY') {
        return { faceFound: false, error: 'A qualidade da imagem é muito baixa (borrada ou subexposta). Tente uma imagem mais nítida e bem iluminada.'};
    }

    return { faceFound: true };

  } catch (error: any) {
    console.error('Erro na API Google Vision:', error);
    return { faceFound: false, error: 'Ocorreu um erro durante a análise facial.' };
  }
}
