
'use server';
/**
 * @fileOverview Fluxo de autenticação facial que coordena a verificação e o registro de dados.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { appendToSheet } from '@/services/google-sheets';
import { detectSingleFace } from '@/services/vision';

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
 * Se um rosto válido for detectado, ele retorna sucesso.
 * Se for um registro (com nome, email, telefone), ele salva os dados na planilha.
 */
const verifyFaceFlow = ai.defineFlow(
  {
    name: 'verifyFaceFlow',
    inputSchema: VerifyFaceInputSchema,
    outputSchema: VerifyFaceOutputSchema,
  },
  async ({ liveImage, name, email, phone }) => {
    
    const isRegistering = !!(name && email && phone);
    
    // Chama o serviço de detecção facial separado
    const faceCheckResult = await detectSingleFace(liveImage);

    if (!faceCheckResult.faceFound) {
      return {
        isMatch: false,
        reason: faceCheckResult.error,
      };
    }
    
    // Se for um registro e a verificação facial for bem-sucedida, salva na planilha.
    if (isRegistering) {
        console.log(`Registrando novo usuário via Face Auth: ${name} (${email}) e salvando na planilha.`);
        try {
            await appendToSheet({
                timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                name: name!,
                email: email!,
                imageId: liveImage.substring(0, 50) + '...', // Salva um trecho da imagem para identificação
                videoBase64: '', 
                paymentId: 'N/A (Registro Facial)', // Indica que não foi via pagamento direto
            });
        } catch (error) {
            console.error('Falha ao salvar na Planilha Google durante registro facial:', error);
            return {
                isMatch: false,
                reason: 'A verificação do rosto foi bem-sucedida, mas houve um erro ao salvar seu registro. Tente novamente.',
            };
        }
    } else {
        console.log('Realizando login de usuário existente via Face Auth.');
    }
    
    // Se um rosto for encontrado, a verificação é considerada um sucesso.
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
