
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-goog-channel-token');

  // Verifica o token secreto que vem da planilha
  if (secret !== process.env.GOOGLE_SHEETS_WEBHOOK_SECRET) {
    console.log("Tentativa de registro não autorizada. Token incorreto ou ausente.");
    return NextResponse.json({ success: false, message: 'Não autorizado' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Registra os dados recebidos no console para eu poder verificar
    console.log("========== DADOS DE CADASTRO RECEBIDOS ==========");
    console.log("Nome:", data.nome);
    console.log("Email:", data.email);
    console.log("Telefone:", data.telefone);
    console.log("Imagem (iniciais):", data.faceImage?.substring(0, 50) + '...');
    console.log("Vídeo (iniciais):", data.faceVideo?.substring(0, 50) + '...');
    console.log("===============================================");
    
    // Responde para o Google Script que a operação foi um sucesso.
    return NextResponse.json({ success: true, message: 'Dados recebidos pelo ambiente de teste' });
  } catch (error) {
    console.error('Erro ao processar dados de cadastro:', error);
    return NextResponse.json({ success: false, message: 'Erro Interno do Servidor' }, { status: 500 });
  }
}
