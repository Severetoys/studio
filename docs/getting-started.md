
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

   Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis (substitua pelos seus valores):

   ```env
   # Firebase Environment Variables
    NEXT_PUBLIC_FIREBASE_API_KEY="SUA_CHAVE_DE_API"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="SEU_DOMINIO.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="SEU_ID_DE_PROJETO"

    # PayPal Environment Variables
    NEXT_PUBLIC_PAYPAL_CLIENT_ID="SEU_CLIENT_ID_PUBLICO_DO_PAYPAL"
    PAYPAL_CLIENT_SECRET="SEU_SEGREDO_DO_PAYPAL"

    # Mercado Pago Environment Variables
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="SUA_CHAVE_PUBLICA_DO_MERCADO_PAGO"
    MERCADOPAGO_ACCESS_TOKEN="SEU_TOKEN_DE_ACESSO_DO_MERCADO_PAGO"

    # Social Media API Tokens (Server-Side)
    TWITTER_BEARER_TOKEN="SEU_BEARER_TOKEN_DO_TWITTER"
    INSTAGRAM_FEED_ACCESS_TOKEN="SEU_TOKEN_DE_ACESSO_PARA_O_FEED"
    INSTAGRAM_SHOP_ACCESS_TOKEN="SEU_TOKEN_DE_ACESSO_PARA_A_LOJA"
    FACEBOOK_PAGE_ACCESS_TOKEN="SEU_TOKEN_DE_ACESSO_DA_PAGINA"

    # Google AI (Gemini) API Key
    GEMINI_API_KEY="SUA_API_KEY_DO_GEMINI"

   ```

   *Nota: As chaves privadas do Firebase Admin SDK estão no arquivo `serviceAccountKey.json` e devem ser manuseadas com segurança, não expostas publicamente.*

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
