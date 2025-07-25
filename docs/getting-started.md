# Primeiros Passos para Configurar o Projeto Italo Santos

Siga estes passos para configurar e executar o projeto Italo Santos em seu ambiente de desenvolvimento local.

## Pré-requisitos

- Node.js (versão 18 ou superior recomendada)
- npm ou yarn
- Conta Firebase e um projeto configurado
- Chaves de API para integrações (Mercado Pago, PayPal, Google Sheets, etc.)

## Configuração do Ambiente

1. Clone o repositório:

   ```bash
   git clone [URL do Repositório]
   cd [Nome da Pasta do Projeto]
   ```

2. Instale as dependências:

   ```bash
   npm install
   # ou yarn install
   ```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis (substitua pelos seus valores):

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

   # Variáveis para Firebase Admin SDK (para backend/functions)
   FIREBASE_PRIVATE_KEY_ID=...
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_CLIENT_ID=...
   FIREBASE_AUTH_URI=...
   FIREBASE_TOKEN_URI=...
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=...
   FIREBASE_CLIENT_X509_CERT_URL=...
   FIREBASE_UNIVERSE_DOMAIN=...

   # Variáveis para integrações (exemplo)
   MERCADOPAGO_ACCESS_TOKEN=...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   GOOGLE_SHEETS_API_KEY=...
   # Adicione outras variáveis de integração aqui
   ```

   *Nota: As chaves privadas do Firebase Admin SDK devem ser manuseadas com segurança e não devem ser expostas publicamente.*

4. Configure o Firebase CLI:

   Certifique-se de ter o Firebase CLI instalado (`npm install -g firebase-tools`). Faça login e associe o projeto local ao seu projeto Firebase:

   ```bash
   firebase login
   firebase use --add
   ```

5. Configure o Data Connect (se aplicável):

   Se o Data Connect estiver sendo usado, siga as instruções de configuração específicas para ele.

## Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou yarn dev
```

O aplicativo estará disponível em `http://localhost:3000`.

## Executando as Firebase Functions (Localmente)

Se você precisar testar as funções do Firebase localmente:

```bash
firebase emulators:start
```

