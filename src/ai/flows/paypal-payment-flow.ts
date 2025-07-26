
'use server';
/**
 * @fileOverview Fluxo para criar uma ordem de pagamento no PayPal.
 * - createPayPalOrder: Gera uma ordem de pagamento e retorna o ID para o frontend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import paypal from '@paypal/checkout-server-sdk';

// Schema de entrada
const CreatePayPalOrderInputSchema = z.object({
  amount: z.number().describe('O valor do pagamento em BRL.'),
  currencyCode: z.string().default('BRL').describe('O código da moeda (ex: "BRL", "USD").'),
});
export type CreatePayPalOrderInput = z.infer<typeof CreatePayPalOrderInputSchema>;

// Schema de saída
const CreatePayPalOrderOutputSchema = z.object({
  orderID: z.string().optional().describe('O ID da ordem de pagamento gerada.'),
  error: z.string().optional().describe('Mensagem de erro, se houver.'),
});
export type CreatePayPalOrderOutput = z.infer<typeof CreatePayPalOrderOutputSchema>;


/**
 * Configura o ambiente do PayPal.
 * @returns {paypal.core.PayPalHttpClient} O cliente HTTP do PayPal.
 */
function payPalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Credenciais do PayPal (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET) não estão configuradas.");
    }

    // Altere para `LiveEnvironment` em produção
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
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
 * Função exportada para ser chamada do lado do cliente.
 */
export async function createPayPalOrder(input: CreatePayPalOrderInput): Promise<CreatePayPalOrderOutput> {
  return createPayPalOrderFlow(input);
}
