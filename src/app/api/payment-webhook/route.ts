
'use server';
/**
 * @fileOverview Endpoint de API para receber webhooks de pagamento.
 * Este endpoint é projetado para ser chamado pelo nosso próprio frontend (via botão do PayPal)
 * ou por um sistema de pagamento externo quando um pagamento é concluído.
 * Ele atualiza a Planilha Google com o ID do pagamento.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updatePaymentIdForUser } from '@/services/google-sheets';
import { z } from 'zod';

// Define o schema esperado para os dados do corpo da requisição.
const PaymentWebhookSchema = z.object({
  // O e-mail deve ser opcional, pois nem todos os webhooks de sistema o enviam.
  // A validação principal será se temos um paymentId.
  email: z.string().email({ message: "Formato de email inválido." }).optional(),
  paymentId: z.string().min(1, { message: "O ID de pagamento não pode estar vazio." }),
  // Adicionamos os detalhes do pagador para registrar um novo usuário se necessário.
  payer: z.object({
    name: z.string(),
    email: z.string().email(),
  }).optional(),
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
      // Se a validação falhar, retorna um erro 400 com os detalhes.
      console.error('[Webhook] Falha na validação do payload:', validationResult.error.flatten());
      return NextResponse.json(
        { message: 'Dados inválidos.', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { paymentId, payer } = validationResult.data;

    if (!payer || !payer.email) {
       console.error('[Webhook] Erro: Payer ou email do payer não fornecido no corpo da requisição.');
       return NextResponse.json({ message: 'Dados do pagador são obrigatórios.' }, { status: 400 });
    }

    console.log(`[Webhook] Recebida atualização de pagamento para o email: ${payer.email} com ID: ${paymentId}`);

    // Chama a função de serviço para encontrar o usuário pelo email e atualizar a coluna de pagamento.
    // Esta função agora também pode registrar o usuário se ele não existir.
    await updatePaymentIdForUser(payer.email, paymentId, payer.name);

    console.log(`[Webhook] Planilha atualizada com sucesso para o email: ${payer.email}`);

    // Retorna uma resposta de sucesso.
    return NextResponse.json({ message: 'Planilha atualizada com sucesso.' }, { status: 200 });

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
