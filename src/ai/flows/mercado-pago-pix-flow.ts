
'use server';
/**
 * @fileOverview Fluxo para criar um pagamento Pix no Mercado Pago.
 * - createPixPayment: Gera um QR Code Pix para um determinado valor e e-mail.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Schema de entrada
const CreatePixPaymentInputSchema = z.object({
  amount: z.number().describe('O valor do pagamento em BRL.'),
  email: z.string().email().describe('O e-mail do pagador.'),
});
export type CreatePixPaymentInput = z.infer<typeof CreatePixPaymentInputSchema>;

// Schema de saída
const CreatePixPaymentOutputSchema = z.object({
  qrCodeBase64: z.string().optional().describe('A imagem do QR Code em base64.'),
  qrCode: z.string().optional().describe('O código "copia e cola" do Pix.'),
  error: z.string().optional().describe('Mensagem de erro, se houver.'),
});
export type CreatePixPaymentOutput = z.infer<typeof CreatePixPaymentOutputSchema>;

/**
 * Fluxo Genkit para criar um pagamento Pix.
 */
const createPixPaymentFlow = ai.defineFlow(
  {
    name: 'createPixPaymentFlow',
    inputSchema: CreatePixPaymentInputSchema,
    outputSchema: CreatePixPaymentOutputSchema,
  },
  async ({ amount, email }) => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken || accessToken === "YOUR_MERCADOPAGO_ACCESS_TOKEN") {
      const errorMessage = "O token de acesso do Mercado Pago (MERCADOPAGO_ACCESS_TOKEN) não está configurado.";
      console.error(errorMessage);
      return { error: errorMessage };
    }

    const client = new MercadoPagoConfig({ 
      accessToken, 
      options: { integratorId: 'dev_aa2d89add88111ebb2fb0242ac130004' }
    });
    const payment = new Payment(client);
    
    const paymentData = {
      transaction_amount: amount,
      description: 'Assinatura Mensal - Italo Santos',
      payment_method_id: 'pix',
      payer: {
        email: email,
      },
      notification_url: 'https://seusite.com/api/webhook/mercadopago', // Você precisará criar este endpoint
    };

    try {
      const response = await payment.create({ body: paymentData });
      
      const qrCodeBase64 = response.point_of_interaction?.transaction_data?.qr_code_base64;
      const qrCode = response.point_of_interaction?.transaction_data?.qr_code;

      if (!qrCodeBase64 || !qrCode) {
        throw new Error('A resposta da API do Mercado Pago não incluiu os dados do QR Code.');
      }

      return {
        qrCodeBase64,
        qrCode,
      };

    } catch (error: any) {
      console.error('Erro ao criar pagamento Pix:', error?.cause || error.message);
      return { error: 'Não foi possível gerar o código Pix. Por favor, tente novamente mais tarde.' };
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function createPixPayment(input: CreatePixPaymentInput): Promise<CreatePixPaymentOutput> {
  return createPixPaymentFlow(input);
}
