// functions/src/faceAuth.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializar o SDK Admin do Firebase (se ainda não estiver inicializado)
// Verifique se você já faz isso em outro arquivo e importe a instância, ou inicialize aqui se for a primeira função a usar.
// Com base na sua lista de arquivos, src/lib/firebase-admin.ts parece existir, mas é um arquivo cliente. Vamos inicializar aqui para a função.
if (!admin.apps.length) {
  admin.initializeApp();
}


// Importar a biblioteca do seu serviço de visão computacional escolhido
// Exemplo com um cliente fictício de reconhecimento facial
// Certifique-se de instalar a dependência correspondente (ex: npm install @google-cloud/vision --prefix functions)
// const Vision = require('@google-cloud/vision');
// const visionClient = new Vision.ImageAnnotatorClient(); // Exemplo para Vision AI (principalmente detecção)

// Ou um cliente para uma API de reconhecimento facial (ex: AWS Rekognition, Azure Face API, ou outro)
// const recognitionClient = new YourFaceRecognitionClient(); // Cliente fictício


// Função HTTPS Callable para login facial
// https://firebase.google.com/docs/functions/callable
export const authenticateFace = functions.https.onCall(async (data, context) => {
  // Verificar a autenticação do usuário que chama a função (opcional, dependendo do fluxo)
  // Para login facial, o usuário pode não estar autenticado ainda, mas talvez você queira
  // permitir apenas chamadas de clientes com um App Check token válido, por exemplo.
  /*
  if (!context.auth) {
     throw new functions.https.HttpsError('unauthenticated', 'Função requer autenticação.');
  }
  const callerUid = context.auth.uid;
  */

  const { imageUrl } = data; // Espera a URL da imagem recém-capturada no Cloud Storage

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A URL da imagem é obrigatória e deve ser uma string.');
  }

  try {
    // 1. Baixar a imagem do Cloud Storage (requer permissões adequadas para a conta de serviço da Cloud Function)
    // Certifique-se de que a conta de serviço padrão das Cloud Functions tenha a permissão "Storage Object Viewer" ou similar.
    const bucket = admin.storage().bucket();
    const file = bucket.file(getImagePathFromUrl(imageUrl)); // Função auxiliar para obter o caminho do arquivo a partir da URL
    const [imageBuffer] = await file.download();

    if (!imageBuffer || imageBuffer.length === 0) {
         throw new functions.https.HttpsError('internal', 'Falha ao baixar a imagem do Cloud Storage.');
    }


    // 2. Processar a imagem com o serviço de visão computacional para reconhecimento facial
    // Esta é a parte mais específica e depende do serviço de visão que você usar.
    // Você enviaria 'imageBuffer' para a API de reconhecimento facial para comparar com
    // as imagens ou modelos faciais armazenados no seu banco de dados (Firestore, RTDB, etc.).

    // Exemplo Conceitual: Chamar uma função interna que interage com a API de reconhecimento
    // Essa função retornaria o userId correspondente e um nível de confiança, ou null se não houver correspondência.
    const { matchedUserId, confidence } = await recognizeFace(imageBuffer); // Função fictícia 'recognizeFace'

    if (!matchedUserId || confidence < 0.8) { // Exemplo de limite de confiança
      // Opcional: Limpar a imagem carregada se o reconhecimento falhar para economizar espaço
      // await file.delete();
      throw new functions.https.HttpsError('unauthenticated', 'Rosto não reconhecido ou confiança baixa.');
    }

    // 3. Gerar um Firebase Custom Token para o usuário encontrado
    try {
      const customToken = await admin.auth().createCustomToken(matchedUserId);
      // Opcional: Adicionar claims personalizados ao token, se necessário
      // const customToken = await admin.auth().createCustomToken(matchedUserId, { role: 'subscriber' });

      // 4. Retornar o Custom Token para o frontend
      return { customToken };

    } catch (error) {
      console.error("Erro ao criar Custom Token:", error);
      // Opcional: Limpar a imagem carregada em caso de erro no token
      // await file.delete();
      throw new functions.https.HttpsError('internal', 'Erro ao gerar token de autenticação.');
    }

  } catch (error: any) {
    console.error("Erro na função authenticateFace:", error);
    // Tratar diferentes tipos de erros e lançar HttpsError apropriado
    if (error instanceof functions.https.HttpsError) {
      throw error; // Relança erros HttpsError customizados
    }
    // Para outros erros inesperados, lance um erro interno genérico
    throw new functions.https.HttpsError('internal', 'Ocorreu um erro inesperado durante a autenticação facial.', error.message);
  }
});


// Função auxiliar para obter o caminho do arquivo do Cloud Storage a partir de uma URL
// Você precisará implementar isso com base no formato das URLs que seu frontend gera.
function getImagePathFromUrl(imageUrl: string): string {
  console.log(`Extracting path from URL: ${imageUrl}`);
  // Implemente a lógica para extrair o caminho do arquivo (ex: 'user-uploads/userId/image.jpg')
  // de diferentes formatos de URL do Storage (gs://bucket/path/to/file, https://firebasestorage.googleapis.com/...)

  try {
      const url = new URL(imageUrl);
      if (url.protocol === 'gs:') {
          // gs://<bucket>/<object-path>
          const bucketName = url.host;
          const objectPath = url.pathname.substring(1); // Remove a barra inicial
          return objectPath;
      } else if (url.protocol === 'https:') {
          // Ex: https://firebasestorage.googleapis.com/v0/b/your-bucket.appspot.com/o/user-uploads%2FuserId%2Fimage.jpg?alt=media...
          // Você precisará analisar o caminho e decodificar a URL
           const pathSegments = url.pathname.split('/');
           const objectPathEncoded = pathSegments.slice(5).join('/'); // Pular /v0/b/bucket/o/
           const objectPath = decodeURIComponent(objectPathEncoded.split('?')[0]); // Decodificar e remover query params
           return objectPath;

      }
       throw new Error("Unsupported URL format");
  } catch (error) {
      console.error("Failed to parse Storage URL:", error);
      // Pode precisar de uma forma mais robusta de lidar com URLs ou receber o caminho diretamente do frontend
      throw new functions.https.HttpsError('invalid-argument', 'Formato de URL de imagem inválido.');
  }
}


// Função fictícia para interagir com o serviço de reconhecimento facial
// ESTA FUNÇÃO PRECISA SER IMPLEMENTADA COM A LÓGICA DO SEU SERVIÇO DE VISÃO ESCOLHIDO
async function recognizeFace(imageBuffer: Buffer): Promise<{ matchedUserId: string | null, confidence: number }> {
  console.log("Processing image for face recognition...");

  // --- Lógica de Interação com o Serviço de Visão Computacional ---
  // Aqui você chamaria a API do seu serviço de visão (Google Vision AI, AWS Rekognition, Azure Face API, etc.)
  // para:
  // 1. Detectar rostos na 'imageBuffer'.
  // 2. Comparar o(s) rosto(s) detectado(s) com os dados faciais armazenados dos usuários no seu banco de dados.
  //    Isso geralmente envolve:
  //    a. Extrair características faciais (vetores) da 'imageBuffer'.
  //    b. Consultar seu banco de dados de modelos faciais para encontrar um vetor correspondente.
  //    c. Obter o userId associado ao vetor encontrado.
  //    d. Determinar um nível de confiança para a correspondência.

  // Exemplo MUITO SIMPLIFICADO (SUBSTITUA PELA LÓGICA REAL DA API DE VISÃO)
  // Isso é APENAS para demonstração da estrutura da função.
  const simulatedRecognitionResult = {
      userId: 'some_user_id_from_db', // Simula o ID do usuário encontrado
      matchConfidence: 0.98 // Simula o nível de confiança
  };

  if (simulatedRecognitionResult.matchConfidence > 0.9) { // Limite de confiança simulado
      return {
          matchedUserId: simulatedRecognitionResult.userId,
          confidence: simulatedRecognitionResult.matchConfidence
      };
  } else {
      return {
          matchedUserId: null,
          confidence: simulatedRecognitionResult.matchConfidence
      };
  }
}