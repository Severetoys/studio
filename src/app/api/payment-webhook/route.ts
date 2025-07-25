
'use server';
/**
 * @fileOverview Endpoint de API para receber webhooks de pagamento.
 * Este endpoint é projetado para ser chamado pelo nosso próprio frontend
 * ou por um sistema de pagamento externo quando um pagamento é concluído.
 * Ele salva os detalhes do pagamento no Firebase Realtime Database.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { savePaymentDetails } from '@/services/user-auth-service';
import { z } from 'zod';

// Define o schema esperado para os dados do corpo da requisição.
const PaymentWebhookSchema = z.object({
  paymentId: z.string().min(1, { message: "O ID de pagamento não pode estar vazio." }),
  payer: z.object({
    name: z.string().optional(), // Nome pode ser opcional
    email: z.string().email({ message: "O email fornecido é inválido." }),
  }),
});

/**
 * Manipula as requisições POST para o endpoint do webhook de pagamento.
 * @param request O objeto de requisição do Next.js.
 * @returns Um objeto de resposta do Next.js.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Webhook] Recebido payload:', JSON.stringify(body, null, 2));

    // Valida os dados recebidos contra o schema.
    const validationResult = PaymentWebhookSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('[Webhook] Falha na validação do payload:', validationResult.error.flatten());
      return NextResponse.json(
        { message: 'Dados inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { paymentId, payer } = validationResult.data;
    const { email, name } = payer;

    console.log(`[Webhook] Recebida atualização de pagamento para o email: ${email} com ID: ${paymentId}`);

    // Chama a função de serviço para salvar os detalhes do pagamento no Realtime Database.
    await savePaymentDetails({
      paymentId,
      customerEmail: email,
      customerName: name || 'Nome não fornecido',
    });

    console.log(`[Webhook] Detalhes do pagamento salvos com sucesso para o email: ${email}`);

    // Retorna uma resposta de sucesso.
    return NextResponse.json({ message: 'Detalhes do pagamento salvos com sucesso.' }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook] Erro ao processar o webhook de pagamento:', error);

    // Trata o caso de JSON malformado.
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Corpo da requisição JSON malformado.' }, { status: 400 });
    }

    // Retorna um erro genérico do servidor.
    return NextResponse.json(
      { message: 'Erro interno do servidor ao processar o webhook.', error: error.message },
      { status: 500 }
    );
  }
}
