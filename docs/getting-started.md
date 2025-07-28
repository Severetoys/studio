
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
   # Firebase Environment Variables
   NEXT_PUBLIC_FIREBASE_API_KEY="SUA_CHAVE_DE_API"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="SEU_DOMINIO.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="SEU_ID_DE_PROJETO"

   # Firebase Admin SDK (Server-Side)
   # Copie estes valores do seu arquivo serviceAccountKey.json
   # ATENÇÃO: A private_key deve ser copiada exatamente como está no JSON,
   # incluindo as quebras de linha (\n).
   FIREBASE_ADMIN_PROJECT_ID="SEU_PROJECT_ID_DO_ADMIN_SDK"
   FIREBASE_ADMIN_CLIENT_EMAIL="SEU_CLIENT_EMAIL_DO_ADMIN_SDK"
   FIREBASE_ADMIN_PRIVATE_KEY="SUA_PRIVATE_KEY_DO_ADMIN_SDK"

   # PayPal Environment Variables
   # Usado no lado do servidor para autenticação
   PAYPAL_CLIENT_ID="SEU_CLIENT_ID_DO_PAYPAL"
   PAYPAL_CLIENT_SECRET="SEU_SEGREDO_DO_PAYPAL"
   # Usado no lado do cliente para o SDK do PayPal (geralmente o mesmo valor do PAYPAL_CLIENT_ID)
   NEXT_PUBLIC_PAYPAL_CLIENT_ID="SEU_CLIENT_ID_DO_PAYPAL"

   # Mercado Pago Environment Variables
   # Chave pública para o SDK do Mercado Pago no lado do cliente
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="SUA_CHAVE_PUBLICA_DO_MERCADO_PAGO"
   # Token de acesso para operações no lado do servidor
   MERCADOPAGO_ACCESS_TOKEN="SEU_TOKEN_DE_ACESSO_DO_MERCADO_PAGO"

   # Social Media API Tokens (Server-Side)
   TWITTER_BEARER_TOKEN="SEU_BEARER_TOKEN_DO_TW
   ```

4. Configure o Firebase CLI:

   Certifique-se de ter o Firebase CLI instalado (`npm install -g firebase-tools`). Faça login e associe o projeto local ao seu projeto Firebase:

   ```bash
   firebase login
   firebase use --add
   ```

## Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou yarn dev
```

O aplicativo estará disponível em `http://localhost:3000` (ou a porta que você configurar).
