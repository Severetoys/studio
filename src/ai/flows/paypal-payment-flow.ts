
'use server';
/**
 * @fileOverview Fluxo para criar e capturar ordens de pagamento no PayPal.
 * - createPayPalOrder: Gera uma ordem de pagamento e retorna o ID para o frontend.
 * - capturePayPalOrder: Captura o pagamento após a aprovação do usuário.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import paypal from '@paypal/checkout-server-sdk';

// Schema de entrada para criar ordem
const CreatePayPalOrderInputSchema = z.object({
  amount: z.number().describe('O valor do pagamento em BRL.'),
  currencyCode: z.string().default('BRL').describe('O código da moeda (ex: "BRL", "USD").'),
});
export type CreatePayPalOrderInput = z.infer<typeof CreatePayPalOrderInputSchema>;

// Schema de saída para criar ordem
const CreatePayPalOrderOutputSchema = z.object({
  orderID: z.string().optional().describe('O ID da ordem de pagamento gerada.'),
  error: z.string().optional().describe('Mensagem de erro, se houver.'),
});
export type CreatePayPalOrderOutput = z.infer<typeof CreatePayPalOrderOutputSchema>;

// Schema de entrada para capturar ordem
const CapturePayPalOrderInputSchema = z.object({
    orderID: z.string().describe('O ID da ordem do PayPal a ser capturada.'),
});
export type CapturePayPalOrderInput = z.infer<typeof CapturePayPalOrderInputSchema>;

// Schema de saída para capturar ordem
const CapturePayPalOrderOutputSchema = z.object({
    success: z.boolean(),
    details: z.any().optional(),
    error: z.string().optional(),
});
export type CapturePayPalOrderOutput = z.infer<typeof CapturePayPalOrderOutputSchema>;

/**
 * Configura o ambiente do PayPal.
 * @returns {paypal.core.PayPalHttpClient} O cliente HTTP do PayPal.
 */
function payPalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Credenciais do PayPal (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) não estão configuradas corretamente no ambiente do servidor.");
    }
    
    // Usa LiveEnvironment para produção, pois as credenciais de produção foram fornecidas.
    const environment = new paypal.core.LiveEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(environment);
}

/**
 * Fluxo Genkit para criar uma ordem de pagamento no PayPal.
 */
const createPayPalOrderFlow = ai.defineFlow(
  {
    name: 'createPayPalOrderFlow',
    inputSchema: CreatePayPalOrderInputSchema,
    outputSchema: CreatePayPalOrderOutputSchema,
  },
  async ({ amount, currencyCode }) => {
    try {
        const client = payPalClient();
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currencyCode,
                        value: amount.toFixed(2),
                    },
                    description: 'Assinatura Mensal - Italo Santos',
                },
            ],
        });

        const response = await client.execute(request);

        if (response.statusCode !== 201) {
             throw new Error(`Falha ao criar ordem no PayPal. Status: ${response.statusCode}`);
        }

        return {
            orderID: response.result.id,
        };

    } catch (error: any) {
      const errorMessage = error.message || 'Não foi possível criar a ordem de pagamento no PayPal.';
      console.error('Erro ao criar ordem no PayPal:', error);
      return { error: errorMessage };
    }
  }
);


/**
 * Fluxo Genkit para capturar uma ordem de pagamento no PayPal.
 */
const capturePayPalOrderFlow = ai.defineFlow(
  {
    name: 'capturePayPalOrderFlow',
    inputSchema: CapturePayPalOrderInputSchema,
    outputSchema: CapturePayPalOrderOutputSchema,
  },
  async ({ orderID }) => {
    try {
        const client = payPalClient();
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({}); // O corpo é vazio para a captura

        const response = await client.execute(request);

        if (response.statusCode !== 201) {
             throw new Error(`Falha ao capturar a ordem no PayPal. Status: ${response.statusCode}`);
        }
        
        return {
            success: true,
            details: response.result,
        };

    } catch (error: any) {
        const errorMessage = error.message || `Não foi possível capturar o pagamento para a ordem ${orderID}.`;
        console.error('Erro ao capturar ordem no PayPal:', error);
        return { success: false, error: errorMessage };
    }
  }
);


/**
 * Função exportada para ser chamada do lado do cliente.
 */
export async function createPayPalOrder(input: CreatePayPalOrderInput): Promise<CreatePayPalOrderOutput> {
  return createPayPalOrderFlow(input);
}

/**
 * Função exportada para ser chamada do lado do cliente para capturar o pagamento.
 */
export async function capturePayPalOrder(input: CapturePayPalOrderInput): Promise<CapturePayPalOrderOutput> {
  return capturePayPalOrderFlow(input);
}


/**
 * Obtém a Client ID do PayPal do ambiente do servidor.
 * @returns {Promise<string>} A Client ID do PayPal.
 */
export async function getPayPalClientId(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
        console.warn("A variável de ambiente NEXT_PUBLIC_PAYPAL_CLIENT_ID não está definida no servidor.");
        return "";
    }
    return clientId;
}
